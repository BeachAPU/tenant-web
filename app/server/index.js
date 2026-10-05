import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callLaravel } from './laravel-client.js';
import { resolveEnvironment } from './environment.js';
import { registerTicketRoutes } from './tickets.js';
import { registerResidentRoutes } from './resident.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEVICE_NAME = 'tenant-web';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(
  session({
    name: 'tenant_web_sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (Number(process.env.SESSION_MAX_AGE_MINUTES) || 15) * 60_000,
    },
  }),
);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// The HAZ-APP planning docs (PLANING/system/CLAUDE.md "Login is split by
// portal") describe a *target* design where `global_users` accounts are
// split staff-vs-contact across two separate Laravel endpoints
// (`/tenant/login` vs `/tenant/resident/login`). Checked directly against
// the actual API (app/Http/Controllers/Auth/TenantAuthController.php) as of
// 2026-09-21: that split isn't built yet. There is only one tenant login
// endpoint, `/api/tenant/login`, and its `login()` method never checks
// `account_type` - it accepts any `global_users` row (staff or
// owner/resident contact) with matching credentials and `is_active`. As of
// 2026-09-21 `GlobalUserResource` DOES now expose `account_type` in its
// response (that part landed), but `login()` still doesn't gate on it, so
// this BFF still has no enforced way to reject a staff login itself - that
// gate has to be added on the API side first. Until then, this app works
// exactly like tenant-admin-ui's BFF against this same endpoint.
app.post('/api/tenant/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(422).json({
      error_code: 'validation_error',
      message: 'Email and password are required.',
    });
    return;
  }

  const environment = resolveEnvironment(req);

  let result;
  try {
    result = await callLaravel('/api/tenant/login', {
      method: 'POST',
      body: { email, password, device_name: DEVICE_NAME },
      environment,
    });
  } catch {
    res.status(502).json({
      error_code: 'upstream_unreachable',
      message: 'Could not reach the tenant API.',
    });
    return;
  }

  if (result.status === 200 && result.body?.token) {
    req.session.token = result.body.token;
    req.session.user = toClientUser(result.body.user);
    res.status(200).json({ user: req.session.user, environment });
    return;
  }

  res.status(result.status).json(result.body);
});

app.get('/api/tenant/me', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ data: req.session.user, environment: resolveEnvironment(req) });
    return;
  }
  res.status(401).json({ error_code: 'unauthenticated', message: 'Not signed in.' });
});

app.post('/api/tenant/logout', async (req, res) => {
  if (req.session.token) {
    try {
      await callLaravel('/api/tenant/logout', {
        method: 'POST',
        token: req.session.token,
        environment: resolveEnvironment(req),
      });
    } catch {
      // best-effort revoke; local session is torn down regardless
    }
  }
  req.session.destroy(() => {
    res.clearCookie('tenant_web_sid');
    res.status(204).end();
  });
});

// Self-service password reset - confirmed real and working today:
// `TenantAuthController::forgotPassword()`/`resetPassword()`, backed by the
// `global_users` password broker (Password::broker('global_users')), not
// scoped to staff vs. contact in any way (same as login above).
app.post('/api/tenant/forgot-password', async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) {
    res.status(422).json({ error_code: 'validation_error', message: 'Email is required.' });
    return;
  }

  try {
    const result = await callLaravel('/api/tenant/forgot-password', {
      method: 'POST',
      body: { email },
      environment: resolveEnvironment(req),
    });
    // Enumeration-safe per TENANTS.md: forward Laravel's generic response
    // as-is rather than distinguishing "unknown email" from "sent".
    res.status(result.status).json(result.body ?? {});
  } catch {
    res.status(502).json({
      error_code: 'upstream_unreachable',
      message: 'Could not reach the tenant API.',
    });
  }
});

app.post('/api/tenant/reset-password', async (req, res) => {
  const { email, token, password, password_confirmation } = req.body ?? {};
  if (!email || !token || !password || !password_confirmation) {
    res.status(422).json({
      error_code: 'validation_error',
      message: 'Email, token, and both password fields are required.',
    });
    return;
  }

  try {
    const result = await callLaravel('/api/tenant/reset-password', {
      method: 'POST',
      body: { email, token, password, password_confirmation },
      environment: resolveEnvironment(req),
    });
    res.status(result.status).json(result.body ?? {});
  } catch {
    res.status(502).json({
      error_code: 'upstream_unreachable',
      message: 'Could not reach the tenant API.',
    });
  }
});

// UI preferences (theme/language), saved to the account by the API's
// `PATCH /api/tenant/me/preferences` (UpdatePreferencesRequest). The API
// stores theme as an object, `{ mode: 'light' | 'dark' }` (no 'system'),
// while this app's client works with the plain ThemePreference string - the
// translation both ways happens only here (toApiPreferences/toClientUser),
// so the client never sees the API's shape. 'system' has no API value, so
// picking it only applies locally and leaves the saved theme unchanged.
function toApiPreferences({ theme, locale }) {
  return {
    ...(theme === 'light' || theme === 'dark' ? { theme: { mode: theme } } : {}),
    ...(locale !== undefined ? { locale } : {}),
  };
}

function toClientUser(user) {
  if (!user) return user;
  const mode = user.theme?.mode;
  return { ...user, theme: mode === 'light' || mode === 'dark' ? mode : undefined };
}

app.patch('/api/tenant/me/preferences', async (req, res) => {
  if (!req.session.token) {
    res.status(401).json({ error_code: 'unauthenticated', message: 'Not signed in.' });
    return;
  }

  const { theme, locale } = req.body ?? {};
  const preferences = toApiPreferences({ theme, locale });
  if (Object.keys(preferences).length === 0) {
    res.status(204).end();
    return;
  }

  try {
    const result = await callLaravel('/api/tenant/me/preferences', {
      method: 'PATCH',
      body: preferences,
      token: req.session.token,
      environment: resolveEnvironment(req),
    });

    if (result.status >= 200 && result.status < 300) {
      req.session.user = result.body?.data
        ? toClientUser(result.body.data)
        : {
            ...req.session.user,
            ...(theme !== undefined ? { theme } : {}),
            ...(locale !== undefined ? { locale } : {}),
          };
    }
    res.status(result.status).json(result.body ?? {});
  } catch {
    res.status(502).json({
      error_code: 'upstream_unreachable',
      message: 'Could not reach the tenant API.',
    });
  }
});

registerTicketRoutes(app);
registerResidentRoutes(app);

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'), (err) => {
    if (err) res.status(404).end();
  });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`tenant-web server listening on port ${port}`);
});
