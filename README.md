# Calendar Planner

## Run

```bash
npm install
npm run dev
```

This starts:
- React app on `http://localhost:5173`
- API server on `http://localhost:8787`

## Auth + Database

- Authentication: JWT (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Database: SQLite file at `server/db/calendar.sqlite`
- Planner data is stored per user in `planner_data.payload`

## Production build

```bash
npm run build
npm run start:api
```
