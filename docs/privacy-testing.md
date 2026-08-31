# Privacy Testing Guide

## Network Leakage Test (Mandatory)
1. Open `docs/privacy-test.html` in your browser.
2. Open the Assistant Side Panel and type `/do Click Submit`.
3. Open the **Network Tab** in Developer Tools for the Side Panel.
4. Inspect the `POST /api/agent/plan` request payload.
5. **Verify**:
   - The string `john@example.com` does NOT exist (replaced with `[EMAIL]`).
   - The string `Secret123` does NOT exist.
   - Aadhaar, PAN, and Card numbers are redacted.
6. The test FAILS if any raw protected value crosses the network boundary.

## Performance Benchmark
The scan latency is recorded in the UI. Typical processing for the test page should be under `<10ms`.
