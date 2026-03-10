# Calendar Planner

## Run

```bash
npm install
npm run dev
```

This starts:
- React app on `http://localhost:5173`
- API server on `http://localhost:8787`

## Environment variables

- Frontend API URL: `VITE_API_URL`
- Local development: optional, defaults to `http://localhost:8787`
- Production: set `VITE_API_URL` to your public backend URL (for example `https://api.your-domain.com`)

Example local setup:

```bash
cp .env.example .env
```

## Auth + Database

- Authentication: JWT (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Database: SQLite file at `server/db/calendar.sqlite`
- Planner data is stored per user in `planner_data.payload`

## Production build

```bash
npm run build
npm run start:api
```

## Production with Docker Compose (Coolify)

This repository includes a production stack with:
- `back`: Node/Express API
- `front`: static frontend build served by Nginx
- `caddy`: reverse proxy routing `/api` to backend and all other paths to frontend

Files:
- `docker-compose.yml`
- `Dockerfile.backend`
- `Dockerfile.frontend`
- `Dockerfile.caddy`
- `Caddyfile`

Run locally:

```bash
docker compose up -d --build
```

Important production variables:
- `JWT_SECRET`: set a strong secret in Coolify environment variables

Notes:
- API is exposed behind Caddy at `/api`
- Frontend is built with `VITE_API_URL=/api`
- SQLite data is persisted in Docker volume `calendar_db`

Coolify note:
- Do not publish host ports in `docker-compose.yml` (avoid `80:80` / `443:443`). Coolify's proxy already owns those ports.
- Keep Caddy internal (`expose: 80`) and configure the public domain on the `caddy` service in Coolify.
- Caddy config is baked into the image via `Dockerfile.caddy` (no bind mount), which avoids Coolify file-mount edge cases.
