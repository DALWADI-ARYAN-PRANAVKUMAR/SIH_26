# Testing Guide

We utilize a safe, offline testing approach for Phase 3 before taking the agent to live websites.

## Test Playground
Open `docs/test-playground.html` in Chrome. This provides deterministic IDs and structures for:
1. Form Filling
2. Password Redaction Verification
3. Scroll and Navigation bounds
4. Simulated Dropdowns and Checkboxes

## Real-Website Smoke Tests
After the playground tests pass, try basic queries on:
- Wikipedia (e.g., `/do Scroll down`, `Summarize`)
- GitHub (e.g., `What inputs are here?`)

*Note: The agent is intentionally blocked from attempting to submit financial data.*
