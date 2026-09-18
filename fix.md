# Fix: Vite "Blocked request" host error in dev

## Error

```
Blocked request. This host ("tenant-web.local") is not allowed.
To allow this host, add "tenant-web.local" to `server.allowedHosts` in vite.config.js.
```

## Cause

`docker-compose.dev.yml` routes traffic to the dev container through Traefik using:

```
traefik.http.routers.${APP_SLUG}-dev.rule=Host(`${APP_DOMAIN}`) || Host(`${APP_DOMAIN_DEMO:-${APP_DOMAIN}}`)
```

So requests reach Vite with `Host: tenant-web.local` (or `demo.tenant-web.local`) instead
of `localhost`. Vite 5+ rejects requests with a `Host` header it doesn't recognize by
default (DNS-rebinding protection), unless the host is listed in `server.allowedHosts`.

This showed up right after fixing a related issue: `app/vite.config.ts` had no
`server.host`, so Vite bound to `localhost`-only inside the container and wasn't
reachable through the Docker port mapping at all. Setting `server.host: true` exposed
the dev server — which is what then surfaced this host-check error.

## Fix

`app/vite.config.ts` — add `server.allowedHosts`, sourced from the same `APP_DOMAIN` /
`APP_DOMAIN_DEMO` env vars the compose file already uses (set in `.env`, passed into the
container via `env_file:` in `docker-compose.dev.yml`, so `process.env` has them at
runtime):

```ts
server: {
    host: true,
    allowedHosts: [process.env.APP_DOMAIN, process.env.APP_DOMAIN_DEMO].filter(
        (h): h is string => Boolean(h)
    ),
},
```

Reading from env instead of hardcoding `tenant-web.local` keeps this in sync with
whatever domain(s) `.env` configures (`APP_SLUG`/`APP_DOMAIN` are meant to vary per
deployment, per the comments in `.env.example`).

## Verification

```
curl -H "Host: tenant-web.local" http://localhost:5183/
curl -H "Host: demo.tenant-web.local" http://localhost:5183/
```

Both now return `HTTP 200` instead of the blocked-request error.
