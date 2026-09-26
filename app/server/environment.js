// APP_DOMAIN_DEMO (if configured) serves the same instance against the
// customer's `demo` CustomerEnvironment instead of `live` - resolved fresh
// from the Host the browser actually used on every request that needs it
// (not cached on the session), matching the API's per-request
// X-Tenant-Environment semantics (see .env.example).
export function resolveEnvironment(req) {
  return req.hostname === process.env.APP_DOMAIN_DEMO ? 'demo' : 'live';
}
