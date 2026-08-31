# Troubleshooting Guide

### 1. Extension won't connect to Backend
**Symptom**: "⚠️ The backend server is unreachable. Please ensure it is running on port 8000."
**Fix**: Ensure your terminal is running `uvicorn main:app --reload` inside the `backend` directory.

### 2. Actions aren't triggering on the page
**Symptom**: The agent says it clicked, but nothing happened.
**Fix**: Some modern SPA frameworks intercept raw clicks. The ActionExecutor dispatches `input` and `change` events natively, but complex custom React dropdowns may require the next phase of agent interactions (Vision).

### 3. Agent is hallucinating elements
**Symptom**: The agent tries to click `button_999` which doesn't exist.
**Fix**: This occurs if the page layout shifts significantly. The `ContextManager` uses a `MutationObserver` to re-trigger a context parse. If this fails, refresh the page to rebuild the `ElementRegistry`.
