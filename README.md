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
- Make sure the public domain is attached to the `caddy` service, not `back` and not `front`.
- If you see `Cannot GET /` on the public URL, Coolify is almost certainly reaching the API container directly instead of `caddy`.
- If `https://your-domain/api/health` does not return `{"ok":true}`, inspect the `caddy` and `back` service logs first.

### Coolify checklist

1. Deploy this repository as a Docker Compose application.
2. Attach the public domain to the `caddy` service on port `80`.
3. Set a strong `JWT_SECRET` environment variable.
4. Redeploy the stack.
5. Validate these URLs:
	- `/` -> should return the React app
	- `/api/health` -> should return `{"ok":true}`

Expected service roles:
- `caddy`: the only public entrypoint
- `front`: internal static frontend served through `caddy`
- `back`: internal API served through `caddy` at `/api`

Troubleshooting:
- Public URL returns `Cannot GET /`: the domain is pointing to `back` instead of `caddy`.
- Public URL returns 502/503: `caddy` cannot reach `front` or `back`, or one container is not healthy.
- `/api/health` fails but `/` loads: the proxy to `back:8787` is broken or the API container is failing to start.
