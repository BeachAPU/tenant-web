# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo has two layers:

- **Root** (`/`) — deployment plumbing only: `Makefile`, `docker-compose.yml` (prod), `docker-compose.dev.yml` (dev), `Dockerfile`, `.env` / `.env.example`.
- **`app/`** — the actual application: a Vite + React 19 + TypeScript admin dashboard, built from the "tailwindadmin-react-free" template (shadcn/ui + Tailwind v4 + Radix primitives). All frontend work happens here.

## Commands

Run from `app/`:

```
npm run dev      # vite dev server
npm run build    # tsc && vite build -> app/dist
npm run lint     # eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
npm run preview  # preview a production build
```

There is no test suite/runner configured in this repo (no jest/vitest config despite `msw` being a dependency).

Via Docker (from repo root), preferred for anything that needs Traefik routing or to match prod:

```
make dev         # hot-reload dev container (docker-compose.dev.yml), bind-mounts app/
make dev-build   # same, rebuilding the image first
make dev-down / make dev-logs
make build       # build the prod image
make up          # start prod container detached
make deploy      # build + up --remove-orphans + ps
```

`npm ci` needs `.npmrc`'s `legacy-peer-deps=true`; the Dockerfile builds with `network: host` because the Docker bridge subnet's DNS is dropped by the host's router, which otherwise hangs `npm ci` mid-build.

`app/node_modules` on this host is owned by `root` (populated by a container running as root at some point), so a plain `npm install`/`npm ci` on the host fails with `EACCES`. Workaround: `docker run --rm -v "$(pwd):/app" -w /app node:24-alpine npm install`.

`npm run lint` currently fails outright (`eslint: latest` resolves to ESLint 9, which needs `eslint.config.js`; the repo only has the old `.eslintrc.cjs` format) — this predates any app-level changes, not something a given change broke. Use `npx tsc --noEmit` to type-check in the meantime.

## Architecture

### Routing & layouts

`src/routes/Router.tsx` builds a single `createBrowserRouter` tree with two top-level branches distinguished by layout:

- `FullLayout` (`src/layouts/full/FullLayout.tsx`) — the app shell (sidebar + header, see `src/layouts/full/vertical/`) wrapping dashboard/app pages. The whole branch is nested under `RequireAuth` (`src/routes/RequireAuth.tsx`), which redirects to `/login` unless `useAuth()` reports `status === 'authenticated'`.
- `BlankLayout` (`src/layouts/blank/BlankLayout.tsx`) — unstyled wrapper for `/auth/*` pages (login, register, maintenance, 404). The login/register routes are wrapped in `RedirectIfAuthenticated` (`src/routes/RedirectIfAuthenticated.tsx`), which bounces an already-signed-in user back to `/`.

Every route component is wrapped in `Loadable` (`src/layouts/full/shared/loadable/Loadable.tsx`), which pairs `React.lazy` with a `Suspense` fallback — follow this pattern when adding new routed pages rather than importing them eagerly.

### Feature "apps" pattern

`notes`, `tickets`, and `blog` under `src/views/apps/*` each follow the same three-layer structure — copy it for new features of this shape:

1. `src/api/<app>/<app>-data.ts` — static mock data (no real network calls).
2. `src/context/<app>-context/index.tsx` — a React Context + `useState`/`useEffect` provider whose "fetch" just assigns the mock array; CRUD methods mutate local state only.
3. `src/views/apps/<app>/` (pages) and `src/components/apps/<app>/` (presentational pieces) consume the context. Shared TS types live in `src/types/apps/`.

Still 100% mock data (see "Authentication" below for the one part of the app that talks to the real API).

### Path alias

`tsconfig.json`/`vite.config.ts` map `src/*` to `app/src/*`. Imports across the codebase use the bare `src/...` form (e.g. `import { notesType } from 'src/types/apps/notes'`), not relative `../../..` chains — follow this convention for cross-directory imports.

### UI primitives & theming

`src/components/ui/*` are shadcn/ui-generated components (`components.json`: style `new-york`, Tailwind v4 with CSS variables, base css at `src/css/globals.css`, no separate Tailwind config file since v4 doesn't need one). `ThemeProvider` (`src/components/provider/theme-provider.tsx`) manages `light`/`dark`/`system` theme via a `data-*`/class toggle on `<html>`, persisted to `localStorage` under the `vite-ui-theme` key; `App.tsx` sets `defaultTheme="dark"`.

### Authentication / backend-for-frontend (`app/server/`)

`Dockerfile`'s `runtime` stage runs `node server/index.js` (healthcheck hits `/api/health`), which serves the built `dist/` (SPA fallback to `index.html` for any non-`/api` route) and owns three routes: `POST /api/tenant/login`, `GET /api/tenant/me`, `POST /api/tenant/logout`. This is a backend-for-frontend (BFF), not a thin proxy: the browser only ever holds this app's own `tenant_web_sid` session cookie (`express-session`, in-memory store — fine for one instance, a known limitation if this is ever scaled horizontally); the Laravel API's bearer token lives server-side in `req.session.token` and is never sent to the client. `server/laravel-client.js`'s `callLaravel()` is the one function that talks to Laravel (plain `fetch`, 15s timeout via `AbortController`).

- Unlike the sibling `tenant-admin` repo's BFF, this one does **not** spoof a `Host` header — `TenantAuthController` on the API side resolves the `global_user` by email alone, not by tenant/Host, so `TENANT_SLUG` (still in `.env.example`) is genuinely unused here, not just historical-but-harmless.
- `resolveEnvironment(req)` in `server/index.js` picks `live`/`demo` from `req.hostname` (`APP_DOMAIN` vs `APP_DOMAIN_DEMO`) fresh on every request that needs it (not cached on the session) and is sent as `X-Tenant-Environment` on every Laravel call — matches the API's per-request environment semantics (a session isn't pinned to one environment).
- Frontend auth state: `src/context/auth-context` (`AuthProvider`/`useAuth`) is the single source of truth, seeded on mount from `GET /api/tenant/me`; see "Routing & layouts" above for how `RequireAuth`/`RedirectIfAuthenticated` consume `status`. `Profile.tsx`'s "Logout" button calls `useAuth().logout()` (not just a link to the login page) so the session is actually torn down server-side.
- In dev, `npm run dev` runs Vite and the Express server concurrently (`concurrently`); `vite.config.ts` proxies `/api` to `http://localhost:${PORT}` so browser requests are same-origin (cookies just work, no CORS).
- There are two login pages: `/login` (`src/views/authentication/auth1/Login.tsx`, still under the `auth1` folder name even though the route was shortened from `/auth/auth1/login`) is the real, primary one `RequireAuth`/`Profile.tsx` route to — a plain `CardBox` + `FullLogo` + the shared `AuthLogin` form, no fake social buttons. `/auth/auth2/login` still exists (adds `SocialButtons`, which are non-functional template decoration) but is no longer linked from anywhere in the app; both share the same `AuthLogin` form component (`src/views/authentication/authforms/AuthLogin.tsx`), which calls `useAuth().login(email, password)` for real.
- `notes`/`tickets`/`blog` (see "Feature apps pattern" above) are still 100% mock data — only auth is wired to the real API so far.

Related env vars (`.env.example`, root):
- `LARAVEL_API_URL` — the app is meant to never talk to a database directly; all real data goes through this Laravel API.
- `SESSION_SECRET` / `SESSION_MAX_AGE_MINUTES` — sign/expire the `express-session` cookie.
- `APP_DOMAIN` / `APP_DOMAIN_DEMO` — one running instance answers on both hostnames; see `resolveEnvironment()` above.

### Dev-server host gotcha

`docker-compose.dev.yml` routes Traefik traffic to the dev container using `Host(`${APP_DOMAIN}`)`/`Host(`${APP_DOMAIN_DEMO}`)` rules, so Vite receives requests with `Host: tenant-web.local` (or `demo.tenant-web.local`), not `localhost`. `vite.config.ts` sets `server.host: true` and `server.allowedHosts` from `APP_DOMAIN`/`APP_DOMAIN_DEMO` to satisfy Vite's DNS-rebinding protection (see `.helpers/fix.md`, gitignored, for the original incident writeup if host-blocking errors resurface).

## Code style

- ESLint: `eslint:recommended` + `@typescript-eslint/recommended` + `react-hooks/recommended`, zero warnings allowed (`--max-warnings 0`).
- Prettier: single quotes, semicolons, 2-space indent, 100-char print width, trailing commas everywhere.
- TypeScript strict mode is on (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`).
