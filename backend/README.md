# Privacy Agent Backend (Phase 2)

This is the Python backend that connects the Privacy Browser Agent to a real Large Language Model (LLM) for webpage understanding.

## Requirements

- Python 3.9+
- A Google Gemini API Key

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: Never commit your `.env` file to version control!)*

3. **Run the Server:**
   ```bash
   uvicorn main:app --reload
   ```
   
   The server will start on `http://localhost:8000`.

## Features
- Provides the `/api/chat` endpoint required by the browser extension.
- Passes the highly structured `PageContext` (headings, inputs, buttons, links) securely to the LLM.
- Prevents the extension from needing to ship with hardcoded API keys.
