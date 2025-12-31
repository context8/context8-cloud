<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Context8 CLI Frontend

Minimal UI for Context8 Cloud: email verification login → create API key → save/search solutions.

## Setup
1) `npm install`
2) `.env.local`:
```
VITE_API_BASE=http://localhost:8000   # or your deployment base URL
VITE_OPENROUTER_API_KEY=your_key_here
VITE_OPENROUTER_MODEL=openai/gpt-4o-mini
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
VITE_OPENROUTER_REFERRER=http://localhost:5173
```

## Run
```
npm run dev
```
Open `http://localhost:5173` in your browser.

## Usage
1) Enter email and click “Send Code”
2) Enter verification code and click “Verify and Login” (JWT is saved)
3) Optional: create an API key and use `X-API-Key` for requests
4) Fill required fields in “Save Solution” to write solutions
5) Use “Search” to query your solutions (vector first, keyword fallback)
6) “Demo Chat” calls OpenRouter and uses function call to search Context8 solutions
