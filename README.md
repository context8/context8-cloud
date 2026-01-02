# Context8 Cloud

FastAPI + PostgreSQL backend (and a simple React/Vite frontend) for Context8 cloud mode.

## Features
- Email code login (resend) and JWT sessions
- API key issuance (`/apikeys`) for email-verified users (hashed with SHA256 in DB)
- Solution CRUD + semantic/keyword search (per-API-key isolation with public sharing)
- Optional embedding + vector search (pgvector) with fallback keyword search
- Modal-friendly deployment (`modal deploy modal_app.py`)

## API (essentials)
- `POST /auth/email/send-code` – send verification code
- `POST /auth/email/verify-code` – verify code, returns JWT
- `GET /auth/email/me` – current user info (requires JWT)
- `POST /apikeys` – create API key (Bearer JWT required; only email-verified users)
- `GET /apikeys` / `DELETE /apikeys/{id}` – list/revoke keys
- `POST /solutions` – save solution (requires `Authorization: Bearer <jwt>` or `X-API-Key: <key>`)
- `GET /solutions/{id}` / `GET /solutions` – fetch/list solutions (per-API-key)
- `DELETE /solutions/{id}` – delete solution
- `POST /search` – search solutions; `query` must be non-empty (min length 1)

Auth rules:
- Bearer JWT: signed with `JWT_SECRET`/`JWT_ALG`, audience `context8-api`, issuer `context8.com`, email must be verified.
- API Key: `X-API-Key: <plaintext>` (or `X-API-Keys: k1,k2` for search); hashed (SHA256) in `api_keys.key_hash`, `revoked=false`, user must be `email_verified=true`.
- Public visibility: `solutions.is_public` makes solutions searchable without credentials; `api_keys.is_public` is the default for new solutions.

## Environment Variables (required/important)
- `DATABASE_URL` – PostgreSQL (Neon) URL, include `sslmode=require`
- `JWT_SECRET` – strong secret for JWT signing (do NOT use defaults)
- `JWT_ALG` – default HS256
- `RESEND_API_KEY`, `RESEND_FROM` – for email codes (required for login flow)
- Optional: `API_KEY` (legacy single key), but `/solutions`/`/search` use API Key/JWT above.

## Deployment (Modal)
1) Set env vars (especially `DATABASE_URL`, `JWT_SECRET`, `RESEND_*`).
2) `pip install -r requirements.txt`
3) `modal deploy modal_app.py`
4) Use the returned URL as `CONTEXT8_REMOTE_URL` in context8-mcp; create API Keys via `/apikeys`.

## Frontend (optional)
- Vite app in `frontend/` for login, dashboard, and API key management.
- Configure API base URL (e.g., Modal URL or your reverse proxy) via `.env`.

## Notes
- `X-API-Key` headers must reach the backend (ensure proxies keep custom headers).
- `query` in `/search` must be non-empty; otherwise 422.
- API Keys must be created via `/apikeys` by an email-verified user; random strings won’t work. 
