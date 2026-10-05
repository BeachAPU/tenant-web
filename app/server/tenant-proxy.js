import { Readable } from 'node:stream';
import { callLaravel, streamLaravel } from './laravel-client.js';
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

// Same as proxyTenant, for file downloads - streams Laravel's body through
// (see streamLaravel) instead of JSON-parsing it.
export async function proxyTenantStream(req, res, laravelPath) {
  const token = requireSessionToken(req, res);
  if (!token) return;

  try {
    await streamLaravel(laravelPath, { token, environment: resolveEnvironment(req) }, res);
  } catch {
    if (res.headersSent) {
      res.destroy();
      return;
    }
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

// Laravel's own limits are 10 MB (incident photo) / 20 MB (note attachment);
// this only stops an oversized body from being buffered here at all.
const MAX_FORM_BYTES = 21 * 1024 * 1024;

// Rebuilds an incoming multipart (or JSON) body as a fresh FormData holding
// only the whitelisted `fields` and `files`, so an upload route forwards
// exactly what it names and nothing else - same rule as the JSON routes'
// explicit field picking. `fieldPatterns` whitelists indexed multipart keys
// (`targets[0][building_id]`) that can't be listed one by one. Parsed with
// the platform's own Response.formData() (no multer). Responds itself and
// returns null when the body is refused.
export async function readForm(req, res, { fields = [], files = [], fieldPatterns = [] }) {
  const form = new FormData();

  if (!req.is('multipart/form-data')) {
    for (const key of fields) {
      const value = req.body?.[key];
      if (value !== undefined && value !== null && value !== '') form.set(key, String(value));
    }
    return form;
  }

  const length = Number(req.headers['content-length']);
  if (!Number.isFinite(length) || length > MAX_FORM_BYTES) {
    res.status(413).json({ error_code: 'payload_too_large', message: 'The upload is too large.' });
    return null;
  }

  let incoming;
  try {
    incoming = await new Response(Readable.toWeb(req), {
      headers: { 'content-type': req.headers['content-type'] },
    }).formData();
  } catch {
    res.status(400).json({ error_code: 'bad_request', message: 'The upload could not be read.' });
    return null;
  }

  for (const key of fields) {
    const value = incoming.get(key);
    if (typeof value === 'string' && value !== '') form.set(key, value);
  }
  for (const [key, value] of incoming.entries()) {
    if (typeof value === 'string' && value !== '' && fieldPatterns.some((re) => re.test(key))) {
      form.set(key, value);
    }
  }
  for (const key of files) {
    const value = incoming.get(key);
    if (value instanceof File && value.size > 0) form.set(key, value, value.name);
  }
  return form;
}
