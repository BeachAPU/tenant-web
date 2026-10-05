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

(Historical: the template's mock `notes`/`tickets`/`blog` apps have been removed; every feature now talks to the real API, see "Authentication" below.)

### Path alias

`tsconfig.json`/`vite.config.ts` map `src/*` to `app/src/*`. Imports across the codebase use the bare `src/...` form (e.g. `import { notesType } from 'src/types/apps/notes'`), not relative `../../..` chains — follow this convention for cross-directory imports.

### UI primitives & theming

`src/components/ui/*` are shadcn/ui-generated components (`components.json`: style `new-york`, Tailwind v4 with CSS variables, base css at `src/css/globals.css`, no separate Tailwind config file since v4 doesn't need one). `ThemeProvider` (`src/components/provider/theme-provider.tsx`) manages `light`/`dark`/`system` theme via a `data-*`/class toggle on `<html>`, persisted to `localStorage` under the `vite-ui-theme` key; `App.tsx` sets `defaultTheme="dark"`.

### Authentication / backend-for-frontend (`app/server/`)

`Dockerfile`'s `runtime` stage runs `node server/index.js` (healthcheck hits `/api/health`), which serves the built `dist/` (SPA fallback to `index.html` for any non-`/api` route) and owns three routes: `POST /api/tenant/login`, `GET /api/tenant/me`, `POST /api/tenant/logout`. This is a backend-for-frontend (BFF), not a thin proxy: the browser only ever holds this app's own `tenant_web_sid` session cookie (`express-session`, in-memory store — fine for one instance, a known limitation if this is ever scaled horizontally); the Laravel API's bearer token lives server-side in `req.session.token` and is never sent to the client. `server/laravel-client.js`'s `callLaravel()` is the one function that talks to Laravel (plain `fetch`, 15s timeout via `AbortController`).

- Unlike the sibling `tenant-admin` repo's BFF, this one does **not** spoof a `Host` header — `TenantAuthController` on the API side resolves the `global_user` by email alone, not by tenant/Host, so `TENANT_SLUG` (still in `.env.example`) is genuinely unused here, not just historical-but-harmless.
- This app is meant to be the **owner/resident** portal only (`global_users.account_type = 'contact'`), and `/home/tamas/Desktop/HAZ-APP/PLANING/system/CLAUDE.md`'s "Login is split by portal" describes a *target* design where that's enforced by a separate `/tenant/resident/login` Laravel endpoint, distinct from tenant-admin-ui's `/tenant/login`. **Checked directly against the real API on 2026-09-21 (`app/Http/Controllers/Auth/TenantAuthController.php`, `php artisan route:list` in the `api-dev` container): that split isn't built yet.** There is only one tenant login endpoint, `/api/tenant/login`, shared with tenant-admin-ui, and `login()` never checks `account_type` — any `global_users` row (staff or contact) with correct credentials + `is_active` logs in through it; `GlobalUserResource` doesn't even expose `account_type` in the response, so this BFF has no data to gate on itself. `server/index.js` therefore currently calls the same `/api/tenant/login`, `/api/tenant/logout`, `/api/tenant/forgot-password`, `/api/tenant/reset-password` endpoints tenant-admin-ui's BFF does — restricting this portal to owner/resident accounts only requires an API-side change (adding the account_type gate and/or the dedicated `/tenant/resident/*` endpoints), not something fixable from this repo alone. `PATCH /api/tenant/me/preferences` (theme/language sync) is live on the API. It stores `theme` as `{ mode: 'light' | 'dark' }`, while the client uses a plain `'light' | 'dark' | 'system'` string. `server/index.js` converts between the two (`toApiPreferences`/`toClientUser`) on login, `/me` and the PATCH, so the client never sees the object. `system` isn't sent (the API has no such value) and only applies locally.
- `resolveEnvironment(req)` in `server/index.js` picks `live`/`demo` from `req.hostname` (`APP_DOMAIN` vs `APP_DOMAIN_DEMO`) fresh on every request that needs it (not cached on the session) and is sent as `X-Tenant-Environment` on every Laravel call — matches the API's per-request environment semantics (a session isn't pinned to one environment).
- Frontend auth state: `src/context/auth-context` (`AuthProvider`/`useAuth`) is the single source of truth, seeded on mount from `GET /api/tenant/me`; see "Routing & layouts" above for how `RequireAuth`/`RedirectIfAuthenticated` consume `status`. `Profile.tsx`'s "Logout" button calls `useAuth().logout()` (not just a link to the login page) so the session is actually torn down server-side.
- In dev, `npm run dev` runs Vite and the Express server concurrently (`concurrently`); `vite.config.ts` proxies `/api` to `http://localhost:${PORT}` so browser requests are same-origin (cookies just work, no CORS).
- There are two login pages: `/login` (`src/views/authentication/auth1/Login.tsx`, still under the `auth1` folder name even though the route was shortened from `/auth/auth1/login`) is the real, primary one `RequireAuth`/`Profile.tsx` route to — a plain `CardBox` + `FullLogo` + the shared `AuthLogin` form, no fake social buttons. `/auth/auth2/login` still exists (adds `SocialButtons`, which are non-functional template decoration) but is no longer linked from anywhere in the app; both share the same `AuthLogin` form component (`src/views/authentication/authforms/AuthLogin.tsx`), which calls `useAuth().login(email, password)` for real.
- Real-API features beyond auth, each registered as a module of plain `proxyTenant` passthroughs (`server/tenant-proxy.js`) from `server/index.js`:
  - `server/tickets.js`: the Issues pages (`/issues*`) plus the reporter's side of every ticket. Visibility comes from the API's `TicketContactVisibilityScope`: my own reports (private tickets and incidents) and private tickets on my apartments.
    - There is **no PATCH proxy**: the API rejects every ticket field from a resident. The reporter closes or reopens only through `POST /tickets/:id/confirm` / `/reopen`, and only while the stage is `awaiting_confirmation` (staff resolved it; it auto-closes after 7 days).
    - Also proxied: `GET /tickets/:id/photo`, multipart note `POST /tickets/:id/notes` (`body` + optional `attachment`; `is_public` is never forwarded), `GET /tickets/:id/notes/:noteId/attachment`, and my notification feed (`GET /notifications`, `PATCH /notifications/:uuid/read`).
    - The staff `/api/tenant/buildings*` endpoints return 403 for residents and are deliberately not proxied. `BuildingApartmentPicker` (new issue form) reads `/resident/buildings` and takes each building's `my_apartments`, filtering both lists on the client.
  - `server/resident.js`: the API's footprint-scoped `/api/tenant/resident/*` group:
    - `property-bills` (+ `/:id`, `/:id/file`)
    - `buildings` (+ `/:id`, `/:id/contacts`, which carries the building's representatives plus the tenant's `visible_to_residents` contact cards; `/:id` also has `areas[]`, whose `id` is the `building_area_type_id` an incident takes)
    - `messages` (+ `/:id`, `/:id/download`; the read-only building message board)
    - `incidents` (list with `building_id`/`incident_type_id`/`state=open|closed|all`, default open; multipart `POST` with optional `photo`; `/:id`; `POST`/`DELETE /:id/affected` = "me too"). These are public building incidents in the reduced `PublicIncidentResource` shape, which never includes the reporter, the description or the photo. The reporter reads the full ticket via `/tickets/:id` (same id).
  - The API filters all of these to the caller's own apartments/buildings (`GlobalUserApartmentFootprint`), so neither the BFF nor the client filters anything. File downloads stream through `proxyTenantStream`/`streamLaravel` (never JSON-parsed).
  - Uploads: `readForm()` in `server/tenant-proxy.js` parses the incoming multipart body with the platform's `Response.formData()` (no multer). It keeps only the route's whitelisted fields/files, refuses bodies over 21 MB, and hands a fresh `FormData` to `callLaravel`, which sends it as multipart.
  - Pages: `/buildings`, `/buildings/:id` (tabs Overview/Contacts/Incidents/Messages/Bills, active tab in `?tab=`), `/incidents` (default view: open incidents plus a "Recently closed" card for the last 30 days, filtered on the client since the API has no date filter; below `md` the rows stack via `IncidentPickList` so "Me too" stays visible), `/incidents/new` (`?building_id=` preselects), `/incidents/:id`, `/messages`, `/bills`, `/bills/:id`, `/contacts`.
  - Incidents vs tickets: My Issues (`/issues`) lists `kind=private` only. Shared-area problems are incidents (`src/components/incidents/`, `src/types/incident.ts`).
    - Only one open incident per building + area (or whole building) + incident type may exist. The report form lists the building's open incidents first (with "Me too") and blocks a matching combination up front. A race still gets `409 incident_duplicate` with `details.existing_incident_id`, which the form turns into the same "Me too" prompt.
    - Incident kinds/sub-kinds come from `ticket-options.incident_types`.
  - Workflow UI runs on the status **stage** (`open` / `awaiting_confirmation` / `closed`, on `ticket-options.statuses[].stage` and `Ticket.stage`), never on status keys: `IssueStatusBadge`'s `stageBadgeVariant`, and `ResolutionActions` ("Confirm resolved" / "Still not fixed", reporter only), shared by `/issues/:id` and `/incidents/:id`.
  - Client reads go through `src/lib/api.ts` (`apiGet`, `ActionResult`) / `src/hooks/useApiGet.ts`; writes through `apiSend` (JSON, or multipart for a `FormData` body; failures carry `errorCode`/`details`). Resident types are in `src/types/resident.ts` and display helpers (`BILL_STATUS_BADGE`, `formatAmount`) in `src/lib/resident.ts`.
  - The incident pages and `/buildings/:id` sit under `TicketsProvider`: they need `ticket-options` (incident kinds) and the reporter's `confirmTicket`/`reopenTicket`.
  - Header bell (`layouts/full/vertical/header/Messages.tsx`): my `/notifications` feed. A `TicketResolvedNotification` links to the incident page or `/issues/:id`, where the confirm buttons are. The other notification types are not shown.

Related env vars (`.env.example`, root):
- `LARAVEL_API_URL` — the app is meant to never talk to a database directly; all real data goes through this Laravel API.
- `SESSION_SECRET` / `SESSION_MAX_AGE_MINUTES` — sign/expire the `express-session` cookie.
- `APP_DOMAIN` / `APP_DOMAIN_DEMO` — one running instance answers on both hostnames; see `resolveEnvironment()` above.

### Dev-server host gotcha

`docker-compose.dev.yml` routes Traefik traffic to the dev container using `Host(`${APP_DOMAIN}`)`/`Host(`${APP_DOMAIN_DEMO}`)` rules, so Vite receives requests with `Host: tenant-web.local` (or `demo.tenant-web.local`), not `localhost`. `vite.config.ts` sets `server.host: true` and `server.allowedHosts` from `APP_DOMAIN`/`APP_DOMAIN_DEMO` to satisfy Vite's DNS-rebinding protection (see `.helpers/fix.md`, gitignored, for the original incident writeup if host-blocking errors resurface).

### Light/dark visual refresh (design system)

`.helpers/DESIGN.md` (gitignored) is the design guide shared (kept identical) with `../tenant-admin`, `../admin` and `../mobile` — all four UIs share one style. It was written against admin's TailAdmin components; this app reuses tenant-admin's port of it onto this same shadcn template:
- Brand classes (`.light-panel`, `.light-btn-primary`, `.light-link-action`, `.light-tab`, …) live in `src/css/theme/light-theme.css` / `dark-theme.css` and are imported in `App.tsx` after `globals.css`. `:root:not(.dark)` = light only, `:root.dark` = dark only, plain `:root` = both. Add new brand rules there, never inline hex values.
- `css/globals.css` shadcn tokens are remapped to the brand palette (primary `#153CAA`, navy `#091330`, the shared `--app-font` Arial stack from DESIGN.md §2). The dark `<body>` gradient comes from `dark-theme.css`, so layout wrappers stay `dark:bg-transparent`.
- Primitives already carry the design: `Button` (`primary`/`outline`/`danger`), `Badge` (`success` = active, `light` = inactive, others tinted), `Input`/`Select`/`Textarea` (`.light-input`), `Tabs` (pill tabs), `Dialog` (`.light-modal`), `Table` (rounded bordered wrapper, navy cells), `Alert` `light*` variants (§6 banners).
- Page pattern: `BreadcrumbComp` (title = the sidebar's `nav.*` key) followed by `src/components/shared/ComponentCard` (`title`, `desc`, `headerAction`, `headerSearch`). Card titles name the section, not the page. Server-paginated lists use `src/components/shared/Pagination`.
- Auth pages (`/login`, `/auth/forgot-password`, `/auth/reset-password`) render through `src/views/authentication/AuthPageLayout.tsx` (form half + `.light-auth-panel` brand half, `ThemeToggle` bottom-right). They copy admin-ui's login value for value (DESIGN.md §11), so their forms use `authforms/AuthFormParts.tsx` (`AuthLabel`/`AuthInput`/`AuthBanner`/`AuthSubmit`/`AuthLink`, styled by the `.light-auth-*` classes) instead of the app's `Label`/`Input`/`Alert`/`Button`; these parts and the auth CSS are kept identical to `../tenant-admin`'s. Success banners replace the form. The template's unwired `auth2` login/register demos were removed.
- Header and user menu (DESIGN.md §9): `Header.tsx` = sidebar toggle (+ this app's `Search`) left, `Messages` (notifications, empty state until there's an API) + `Profile` right, nothing else; below `lg` the right side moves behind a More button and the logo mark is centred. The toggle collapses the fixed sidebar to a 90px icon rail at `xl`+ (hover expands it; state in `layouts/full/SidebarState.tsx`, page offset via `.page-wrapper-rail` in `css/layouts/container.css`) and opens the `Sheet` drawer below `xl`. The user menu holds only name/email, My Profile, the Theme + Language segmented pills (`ThemeSwitcher`/`LanguageSwitcher`, both saving to the account via `savePreferences`) and Logout - the theme toggle is no longer in the header (`ThemeToggle` stays only on auth pages). Bar colours: `.light-header` / `.light-header-line`.
- Icons (DESIGN.md §12): only admin-ui's SVG set, copied file for file into `src/icons/` and imported by name (`import { PencilIcon } from 'src/icons'`). `vite.config.ts` loads them with `@svgr/rollup` (`icon: true`, named `ReactComponent` export; the default export stays the file URL, so `<img src={x.svg}>` still works), which is why `src/icons/index.ts` drops admin's `?react` suffix. Pick icons by meaning from the §12.1 catalogue (e.g. Dashboard `GridIcon`, tickets/issues `ChatIcon`, Settings `PlugInIcon`). No icon libraries: `@iconify/react`, `lucide-react` and `react-icons` were removed. Fill-style icons need `fill-current`, and the `Angle*` icons carry a hard-coded path stroke, so recolour them with `[&_path]:stroke-current`. Glyphs admin still draws inline (sun/moon, bell, menu; §12.1 table B) are copied into `src/components/shared/AdminInlineIcons.tsx` until admin moves them into its set.
- Visual checks: `node .helpers/testing/shot.cjs <route[,route…]> <outDir> [baseUrl] [modes] [viewports]` screenshots light/dark × desktop/mobile against the running dev app (`http://tenant-web.local`). It stubs all `/api/**` calls with fixtures and prints horizontal overflow plus console errors. `ANON=1` = signed out, `WAIT=<ms>` = longer settle time (a route's first lazy-chunk compile can outlast the 1.5s default). `.mcp.json` also configures the Playwright MCP; it needs a Claude Code restart to load.

## Code style

- ESLint: `eslint:recommended` + `@typescript-eslint/recommended` + `react-hooks/recommended`, zero warnings allowed (`--max-warnings 0`).
- Prettier: single quotes, semicolons, 2-space indent, 100-char print width, trailing commas everywhere.
- TypeScript strict mode is on (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`).
