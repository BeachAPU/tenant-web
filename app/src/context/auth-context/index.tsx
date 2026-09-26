import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n from 'src/i18n';
import { useTheme } from 'src/components/provider/theme-provider';
import type {
  AuthUser,
  ApiErrorEnvelope,
  TenantEnvironment,
  ThemePreference,
} from 'src/types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type ActionResult = { ok: true } | { ok: false; error: string };
type Preferences = { theme?: ThemePreference; locale?: string };

type AuthContextState = {
  user: AuthUser | null;
  environment: TenantEnvironment | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ActionResult>;
  resetPassword: (params: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) => Promise<ActionResult>;
  savePreferences: (preferences: Preferences) => Promise<void>;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

const genericError = 'Something went wrong. Please try again.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [environment, setEnvironment] = useState<TenantEnvironment | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const { setTheme } = useTheme();

  // The account's saved theme/language follow the user across devices
  // (FEATURES.md "UI preferences & platform tracking") - applied once on
  // every session load/login, after which local changes take over until
  // the next login.
  const applyAccountPreferences = (account: AuthUser | null) => {
    if (!account) return;
    if (account.theme) setTheme(account.theme);
    if (account.locale) i18n.changeLanguage(account.locale);
  };

  useEffect(() => {
    let cancelled = false;

    fetch('/api/tenant/me')
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const { data, environment } = await res.json();
          setUser(data);
          setEnvironment(environment ?? null);
          setStatus('authenticated');
          applyAccountPreferences(data);
        } else {
          setUser(null);
          setEnvironment(null);
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setEnvironment(null);
          setStatus('unauthenticated');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<ActionResult> => {
    const res = await fetch('/api/tenant/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => null);

    if (res.ok && body?.user) {
      setUser(body.user);
      setEnvironment(body.environment ?? null);
      setStatus('authenticated');
      applyAccountPreferences(body.user);
      return { ok: true };
    }

    const err = body as ApiErrorEnvelope | null;
    return { ok: false, error: err?.message ?? 'Unable to sign in. Please try again.' };
  };

  const logout = async () => {
    await fetch('/api/tenant/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setEnvironment(null);
    setStatus('unauthenticated');
  };

  const forgotPassword = async (email: string): Promise<ActionResult> => {
    try {
      const res = await fetch('/api/tenant/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Enumeration-safe: the API returns the same generic success shape
      // whether or not the email is known, so any non-error response here
      // is treated as success.
      if (res.ok) return { ok: true };
      const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null;
      return { ok: false, error: body?.message ?? genericError };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  const resetPassword = async (params: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<ActionResult> => {
    try {
      const res = await fetch('/api/tenant/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return { ok: true };
      const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null;
      return { ok: false, error: body?.message ?? genericError };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  // Local switch applies immediately (theme-provider/i18n already did that
  // by the time this is called); this best-effort account sync just makes
  // the choice follow the user to their next device/browser. A failure
  // here is swallowed - the local switch already took effect either way.
  const savePreferences = async (preferences: Preferences) => {
    setUser((current) => (current ? { ...current, ...preferences } : current));
    try {
      await fetch('/api/tenant/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
    } catch {
      // best-effort only
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        environment,
        status,
        login,
        logout,
        forgotPassword,
        resetPassword,
        savePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');

  return context;
};
