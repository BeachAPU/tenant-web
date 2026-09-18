.PHONY: dev dev-build dev-down dev-logs build up down deploy logs restart ps

# ---- development (standalone, hot reload, no rebuilds on code edits) ----
dev:
	docker compose -f docker-compose.dev.yml up

dev-build:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

# ---- production ----
build:
	docker compose build

up:
	docker compose up -d

# Rebuild the image and (re)start with zero manual steps; old container is
# replaced once the new one passes its HEALTHCHECK.
deploy:
	docker compose build
	docker compose up -d --remove-orphans
	docker compose ps

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

ps:
	docker compose ps
