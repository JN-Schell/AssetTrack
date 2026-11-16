# AssetTrack frontend

React 19 + TypeScript + Vite UI for the AssetTrack API (`/api/v1`).

## Run locally

1. Start the API from `backend/` on port 8000. Seed data and the admin account live in `backend/app/seed.py`.
2. From this directory:

```bash
npm install
npm run dev
```

The dev server is http://localhost:5173. It proxies `/api` and `/media` to http://127.0.0.1:8000.

```bash
npm run build
```

Set `VITE_API_BASE` (for example `http://127.0.0.1:8000`) only when the UI is not using the Vite proxy.
