/**
 * Privacy Module — Redacts sensitive data before sending to reasoning.
 *
 * Phase 1: Pass-through (returns input unchanged).
 * Phase 5+: Will implement PII detection, data masking, configurable redaction rules.
 */

import type { PrivacyResult } from "@/types";

/**
 * Sanitize text by redacting sensitive information.
 *
 * @param text - Raw text to sanitize.
 * @returns Sanitized text and a list of fields that were redacted.
 */
export async function sanitizeText(text: string): Promise<PrivacyResult> {
  // TODO Phase 5: PII detection, email/phone/SSN masking, user-configured rules
  return {
    sanitizedText: text,
    redactedFields: [],
  };
}
