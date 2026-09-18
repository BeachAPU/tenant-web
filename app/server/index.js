import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callLaravel } from './laravel-client.js';

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

// APP_DOMAIN_DEMO (if configured) serves the same instance against the
// customer's `demo` CustomerEnvironment instead of `live` - resolved fresh
// from the Host the browser actually used on every request that needs it
// (not cached on the session), matching the API's per-request
// X-Tenant-Environment semantics (see .env.example).
function resolveEnvironment(req) {
  return req.hostname === process.env.APP_DOMAIN_DEMO ? 'demo' : 'live';
}

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
    req.session.user = result.body.user;
    res.status(200).json({ user: result.body.user, environment });
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
