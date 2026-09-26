import { callLaravel } from './laravel-client.js';
import { resolveEnvironment } from './environment.js';

export function requireSessionToken(req, res) {
  if (!req.session.token) {
    res.status(401).json({ error_code: 'unauthenticated', message: 'Not signed in.' });
    return null;
  }
  return req.session.token;
}

// Thin authenticated passthrough for routes with no session/business logic
// of their own (unlike login/logout/preferences above) - just forward to
// Laravel with the session token + resolved environment, and mirror its
// status/body back, without repeating the try/catch/502 boilerplate for
// every one of these.
export async function proxyTenant(req, res, laravelPath, { method = 'GET', body } = {}) {
  const token = requireSessionToken(req, res);
  if (!token) return;

  try {
    const result = await callLaravel(laravelPath, {
      method,
      body,
      token,
      environment: resolveEnvironment(req),
    });
    res.status(result.status).json(result.body ?? {});
  } catch {
    res.status(502).json({
      error_code: 'upstream_unreachable',
      message: 'Could not reach the tenant API.',
    });
  }
}

// Builds a `?a=1&b=2` query string, dropping undefined/null/empty values so
// omitted optional filters aren't forwarded as literal "undefined".
export function toQueryString(params) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}
