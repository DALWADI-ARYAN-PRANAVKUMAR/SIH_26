# Implementation Steps: SIH26171 Privacy-Preserving AI Browser Agent

This document outlines the detailed step-by-step implementation of the entire project from inception to Phase 4.

---

## Phase 1: UI/UX Shell & Foundation
**Goal:** Establish a robust Chrome Extension architecture capable of running a modern web framework (React) within isolated web environments (Shadow DOM and Side Panel).

1. **Manifest V3 Setup:** 
   - Created `manifest.json` configured with permissions for `activeTab`, `scripting`, `storage`, and `sidePanel`.
   - Setup a Vite + React + TypeScript build pipeline tailored for Chrome Extensions (`@crxjs/vite-plugin`).
2. **Side Panel Integration:** 
   - Implemented a dedicated React application for the `chrome.sidePanel` API to serve as the main command center (Control Center).
3. **Content Script & Shadow DOM:** 
   - Injected a content script into all web pages.
   - Built an isolated Shadow DOM container to host the floating avatar UI, ensuring that the extension's CSS (Tailwind) does not conflict with the host webpage's CSS.
4. **Draggable Avatar Component:** 
   - Implemented physics-based drag-and-drop for the floating avatar.
   - Added state synchronization using `chrome.storage.sync` so avatar position, size, and styling preferences persist across tabs.
5. **State Management:** 
   - Integrated Zustand for lightweight, reactive global state management across the side panel and content scripts via message passing.

---

## Phase 2: Perception Engine (DOM Understanding)
**Goal:** Allow the agent to "see" and "read" the current webpage locally without sending raw HTML to the cloud.

1. **DOM Traversal & Extraction (`DOMExtractor.ts`):** 
   - Wrote a recursive DOM walker to extract meaningful elements (headings, paragraphs, links, buttons, inputs).
2. **Visibility Detection (`VisibilityDetector.ts`):** 
   - Implemented heuristics to ignore hidden elements (`display: none`, `opacity: 0`, off-screen elements) so the LLM doesn't hallucinate actions on invisible nodes.
3. **Page Cleaner (`PageCleaner.ts`):** 
   - Stripped away scripts, styles, SVGs, and tracking pixels to reduce the token payload.
4. **Element Registry (`ElementRegistry.ts`):** 
   - Created a local registry that assigns a unique, temporary ID (e.g., `button_001`, `input_042`) to every interactive element.
   - This prevents the need to send complex CSS selectors or XPaths to the LLM.
5. **Context Manager (`ContextManager.ts`):** 
   - Aggregated all extracted data into a clean, structured JSON object (`PageContext`) representing the semantic state of the webpage.

---

## Phase 3: Browser Action & Control Engine
**Goal:** Empower the agent to execute actions on the webpage safely, driven by LLM planning.

1. **Backend LLM Integration (`backend/main.py`):** 
   - Built a FastAPI Python server to interface with Google Gemini.
   - Engineered a strict system prompt forcing the LLM to output valid JSON matching an `ActionPlan` schema.
2. **Agent Orchestrator (`AgentController.ts`):** 
   - Implemented a finite state machine (`UNDERSTANDING` -> `PLANNING` -> `EXECUTING` -> `VERIFYING`) to handle multi-step agent loops.
3. **Action Execution (`executor.ts`):** 
   - Built a secure execution engine in the content script that translates JSON instructions (e.g., `{"action": "click", "target": "button_001"}`) into raw DOM events (`element.click()`, `element.dispatchEvent(new Event('input'))`).
   - Completely avoided the use of unsafe `eval()` or injecting raw JavaScript.
4. **Task Dashboard UI:** 
   - Added an interactive log in the side panel showing real-time agent thoughts, planned actions, and success/failure verification.
   - Implemented a "requiresConfirmation" interrupt for high-risk actions.

---

## Phase 4: Local Privacy Firewall
**Goal:** Guarantee that sensitive PII (Personally Identifiable Information) never leaves the user's local machine.

1. **Privacy Types & Schema (`types.ts`):** 
   - Defined strict enums for `PrivacyCategory` (e.g., `AADHAAR`, `PAN`, `CREDIT_CARD`, `EMAIL`).
   - Created a new `SanitizedPageContext` type.
2. **Regex Detectors (`RegexDetectors.ts`):** 
   - Implemented highly accurate regex patterns for Indian PII (Aadhaar, PAN, UPI, IFSC) and standard PII (Emails, Phones, API Keys, Cards).
3. **DOM Heuristic Detectors (`DOMDetectors.ts`):** 
   - Analyzed `type`, `name`, `placeholder`, `autocomplete`, and `aria-label` attributes to detect sensitive fields (e.g., Passwords, OTPs) even before the user types anything.
4. **Privacy Engine Orchestrator (`PrivacyEngine.ts`):** 
   - Built a deep-cloning mechanism that iterates over the `PageContext`, applies detectors, and replaces sensitive strings with semantic placeholders (e.g., replacing `john@example.com` with `[EMAIL]`).
5. **Network Boundary Enforcement:** 
   - Updated `AgentController.ts` to pass the context through `PrivacyEngine.sanitize()` *before* making the fetch request to the backend.
   - Modified the LLM prompt to instruct the AI to reason around placeholders natively.
6. **Privacy Audit UI:** 
   - Upgraded the side panel to display a real-time `Privacy Firewall` dashboard showing elements inspected, sensitive elements found, and elements redacted per scan.

---

## Next Steps (Roadmap)
- **Phase 5:** Vision Engine (Local OCR/Screenshots for WebGL/Canvas elements).
- **Phase 6:** Voice Interface (STT/TTS).
