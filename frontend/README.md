<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Context8 Cloud Frontend

Minimal UI for Context8 Cloud: email verification login → create API key → save/search solutions.

## Setup
1) `bun install --frozen-lockfile`
2) `.env.local`:
```
VITE_API_BASE=http://localhost:8000   # or your deployment base URL
```

## Run
```
bun run dev
```
Open `http://localhost:5173` in your browser.

## Usage
1) Enter email and click “Send Code”
2) Enter verification code and click “Verify and Login” (JWT is saved)
3) Optional: create an API key and use `X-API-Key` for requests
4) Fill required fields in “Save Solution” to write solutions
5) Use “Search” to query your solutions
6) “Demo Chat” calls the backend LLM proxy and can search your saved solutions
