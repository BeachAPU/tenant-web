import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// A hung upstream call (e.g. a stalled cache/DB lookup on the Laravel side)
// must not leave the Express handler — and the browser's fetch — waiting
// forever with no feedback.
const UPSTREAM_TIMEOUT_MS = 15_000;

// Unlike tenant-admin's BFF, this app's Laravel calls need no Host-header
// spoofing: TenantAuthController resolves the global_user by email alone,
// not by tenant/Host (see .env.example's TENANT_SLUG comment), so a plain
// fetch works. Which of the customer's `live`/`demo` databases a request
// hits is selected per-call via X-Tenant-Environment instead.
export async function callLaravel(path, { method = 'GET', body, token, environment } = {}) {
  const baseUrl = process.env.LARAVEL_API_URL;
  if (!baseUrl) {
    const err = new Error('LARAVEL_API_URL not configured');
    err.code = 'not_configured';
    throw err;
  }

  const target = new URL(path, baseUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  // A FormData body (file uploads) is sent as multipart - fetch sets the
  // content-type with its boundary itself; everything else goes as JSON.
  const isForm = body instanceof FormData;

  let res;
  try {
    res = await fetch(target, {
      method,
      signal: controller.signal,
      headers: {
        ...(isForm ? {} : { 'content-type': 'application/json' }),
        accept: 'application/json',
        'x-tenant-environment': environment || 'live',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Upstream request timed out');
      timeoutErr.code = 'upstream_timeout';
      throw timeoutErr;
    }
    throw Object.assign(err, { code: err.code || 'upstream_unreachable' });
  } finally {
    clearTimeout(timeout);
  }

  const raw = await res.text();
  let json = null;
  let parseFailed = false;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    parseFailed = true;
  }

  // A 2xx with a body that fails to parse is not a "successful response
  // with no data" — treat it as an upstream failure so callers don't
  // silently mistake it for real, empty data.
  if (parseFailed && res.ok) {
    const err = new Error('Upstream returned an unparsable response body');
    err.code = 'upstream_bad_response';
    throw err;
  }

  return { status: res.status, body: json };
}

// File downloads (bill files, message attachments): pipes Laravel's
// response body straight through instead of buffering/JSON-parsing it, and
// keeps the headers the browser needs to save the file. Resolves to the
// upstream status; a non-2xx JSON error body is forwarded as-is. The
// timeout only covers the wait for response headers, not the body stream.
export async function streamLaravel(path, { token, environment } = {}, res) {
  const baseUrl = process.env.LARAVEL_API_URL;
  if (!baseUrl) {
    const err = new Error('LARAVEL_API_URL not configured');
    err.code = 'not_configured';
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream;
  try {
    upstream = await fetch(new URL(path, baseUrl), {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'x-tenant-environment': environment || 'live',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Upstream request timed out');
      timeoutErr.code = 'upstream_timeout';
      throw timeoutErr;
    }
    throw Object.assign(err, { code: err.code || 'upstream_unreachable' });
  } finally {
    clearTimeout(timeout);
  }

  res.status(upstream.status);
  for (const header of ['content-type', 'content-disposition', 'content-length']) {
    const value = upstream.headers.get(header);
    if (value) res.setHeader(header, value);
  }

  if (!upstream.body) {
    res.end();
    return upstream.status;
  }

  await pipeline(Readable.fromWeb(upstream.body), res);
  return upstream.status;
}
