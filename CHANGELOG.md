# Changelog

## Phase 4 - Local Privacy Firewall
- **Added:** `PrivacyEngine` to detect and redact PII locally.
- **Added:** Regex detectors for Aadhaar, PAN, UPI, Email, Phone, Credit Card, IFSC, API Keys.
- **Added:** DOM metadata heuristics for sensitive input field detection.
- **Added:** `SanitizedPageContext` type enforcement ensuring raw data never hits the backend.
- **Added:** Privacy Dashboard UI in the side panel to display scan status, elements inspected, and redactions made.
- **Changed:** `AgentController` now sanitizes contexts before sending them to the backend Planner.
- **Changed:** Backend Planner prompt updated to understand semantic placeholders like `[EMAIL]`.
- **Security:** Enhanced fail-closed behavior ensures backend requests are aborted if privacy scanning fails.

## Phase 3 - Browser Action & Control Engine
- **Added:** `AgentController` task orchestration.
- **Added:** `executor.ts` content script to securely execute clicks, typing, selecting, and scrolling without `eval()`.
- **Added:** Task Dashboard in Side Panel with Activity Log and Confirmation UI.
- **Added:** Backend `/api/agent/plan` endpoint for strict LLM action JSON generation.
- **Security:** Blocked dangerous `javascript:` navigation. Bound checks on scrolls and waits.

## Phase 2 - Perception Engine
- **Added:** Local DOM parsing into structured `PageContext`.
- **Added:** Invisible element filtering.
- **Added:** Phase 1 architecture refactored for page-aware querying.
- **Security:** `<input type="password">` redaction introduced.

## Phase 1 - UI/UX Shell
- **Added:** Manifest V3 background setup.
- **Added:** Side Panel Chat UI.
- **Added:** Floating Avatar in Web Pages (Shadow DOM).
- **Added:** Dashboard for avatar configuration synchronized with Chrome Storage.
