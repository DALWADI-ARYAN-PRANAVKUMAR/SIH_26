# Installation Guide

## Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and configure `GEMINI_API_KEY`.
4. Run `uvicorn main:app --reload`.

## Extension
1. `cd privacy-browser-agent`
2. `npm install`
3. `npm run build`
4. Load the `dist` folder into Chrome via `chrome://extensions` -> "Load unpacked".

## Dashboard
1. `cd privacy-agent-dashboard`
2. `npm install`
3. `npm run dev`
