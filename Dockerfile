# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json .npmrc ./

# ---- full deps (incl. devDeps), shared by dev + build stages ----
FROM base AS deps
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- prod-only deps, used by the runtime image ----
FROM base AS prod-deps
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---- dev: source is bind-mounted at runtime, this stage just has the
# tooling (vite, node --watch) ready so the container never needs a
# rebuild for code changes, only for dependency changes ----
FROM deps AS dev
ENV NODE_ENV=development
EXPOSE 3000 5173
CMD ["npm", "run", "dev"]

# ---- build: compiles the production bundle ----
FROM deps AS build
COPY . .
RUN npm run build

# ---- runtime: minimal production image ----
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY server ./server
COPY --from=build /app/dist ./dist

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
