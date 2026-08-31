# Security Threat Model

## 1. Sensitive DOM Leakage
- **Threat**: The page contains passwords or PII that the LLM reads.
- **Mitigation**: Phase 4 Privacy Engine detects and redacts text via Regex and DOM metadata heuristcs.
- **Residual Risk**: False negatives if custom input structures obfuscate PII.

## 2. API Key Leakage
- **Threat**: LLM keys scraped from the extension bundle.
- **Mitigation**: Keys are stored in the local FastAPI backend. The frontend has NO secrets.

## 3. Malicious Webpage / Prompt Injection
- **Threat**: A webpage contains "Ignore previous instructions".
- **Mitigation**: The system prompt instructs the planner to treat webpage context strictly as untrusted data. Execution is heavily validated.

## 4. Cross-Origin Iframes
- **Threat**: Unable to perceive or redact data inside cross-origin iframes.
- **Mitigation**: Current architecture skips cross-origin iframes, effectively failing closed (content is uninspected and not sent to LLM).
