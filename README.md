# Context8 Cloud Frontend (Vite)

This repository contains the Vite + React frontend for Context8 Cloud.

The backend service is **not** included in this repo. You must provide a compatible API server and point the frontend to it via `VITE_API_BASE`.

## Quickstart
```bash
cd frontend
bun install --frozen-lockfile
cp .env.local.example .env.local
bun run dev
```

Open `http://localhost:5173`.

## Configuration
Set `VITE_API_BASE` to your backend base URL (e.g. `http://localhost:8000`).

If the backend is not running (or the URL is wrong), the UI will still render, but login / API key management / save / search will fail.

## Backend dependency (high level API contract)
The frontend expects a backend that supports at least these routes:

**Auth**
- `POST /auth/email/send-code`
- `POST /auth/email/verify-code`

**API keys**
- `GET /apikeys`
- `POST /apikeys`
- `PATCH /apikeys/{id}`
- `DELETE /apikeys/{id}`
- `GET /apikeys/stats`

**Solutions & search**
- `GET /solutions`
- `POST /solutions`
- `GET /solutions/{id}`
- `PATCH /solutions/{id}`
- `DELETE /solutions/{id}`
- `GET /solutions/{id}/es` (optional)
- `GET /solutions/count`
- `POST /search`
- `POST /solutions/{id}/vote`
- `DELETE /solutions/{id}/vote`

**Stats**
- `GET /stats/solutions`

Requests are sent with either `Authorization: Bearer <jwt>` or `X-API-Key: <key>` (and `X-API-Keys: k1,k2,...` for multi-key search), depending on the feature.
