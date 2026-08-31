# Privacy Architecture (Phase 4)

The Privacy Firewall is an architectural boundary that ensures raw sensitive data never reaches the cloud backend.

## Flow
1. **DOM Perception**: Extracts raw elements into `PageContext`.
2. **PrivacyEngine**: Applies detectors to mutate and redact PII.
3. **SanitizedPageContext**: The resulting object, replacing sensitive text with semantic placeholders (e.g. `[EMAIL]`).
4. **Backend LLM**: Receives only the sanitized context.

## Supported PII Categories
- `PASSWORD`, `OTP`, `EMAIL`, `PHONE`, `CREDIT_CARD`, `AADHAAR`, `PAN`, `UPI`, `BANK_ACCOUNT`, `IFSC`, `API_KEY`.

## Fail-Closed Behavior
If the PrivacyEngine fails or crashes, the context is blocked and NO network request is made. Raw `PageContext` objects are type-checked to prevent accidental transmission instead of `SanitizedPageContext`.
