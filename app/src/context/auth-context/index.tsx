import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, ApiErrorEnvelope, TenantEnvironment } from 'src/types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextState = {
  user: AuthUser | null;
  environment: TenantEnvironment | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [environment, setEnvironment] = useState<TenantEnvironment | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

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
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
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

  return (
    <AuthContext.Provider value={{ user, environment, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');

  return context;
};
