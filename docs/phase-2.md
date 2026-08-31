# Phase 2: Perception Engine

The phase where the agent gains the ability to securely "read" the DOM without leaking sensitive data.

## Key Features
- **DOMExtractor:** Converts raw HTML to a structured JSON `PageContext`.
- **VisibilityDetector:** Ignores invisible, zero-sized, and `display: none` elements.
- **PageCleaner:** Strips `<script>`, `<style>`, and other non-semantic noise.
- **Password Redaction:** Automatically scrubs `<input type="password">` values and replaces them with `[REDACTED]`.
- **ContextManager:** Debounced mutation observers to prevent excessive re-renders while keeping context fresh.
