# Security & Privacy Policy

Privacy Browser Agent prioritizes user security at the absolute lowest layer possible.

## 1. Local-First Redaction
All `<input type="password">` fields are scrubbed directly within the Content Script (`DOMExtractor.ts`). The `PageContext` payload sent to the backend only ever contains the string `[REDACTED]`. The LLM physically never sees the password.

## 2. API Key Protection
The Chrome extension itself contains *no API keys*. By migrating LLM logic to the local FastAPI backend (`backend/main.py`), we ensure keys cannot be scraped from the extension bundle.

## 3. Sandboxed Execution
The `executor.ts` script strictly disallows `javascript:`, `data:`, and `vbscript:` navigation targets, and does not provide an `execute_js` action type to the LLM.

## 4. User Consent
The LLM can flag an `AgentPlan` with `requiresConfirmation: true`. This pauses execution and opens an interactive confirmation dialog in the Side Panel, granting the user veto power over actions.
