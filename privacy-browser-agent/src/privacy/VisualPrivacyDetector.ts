/**
 * VisualPrivacyDetector.ts
 * Analyzes VisualContext for PII (faces, ID cards, text patterns).
 */

import { detectTextPatterns } from "./detectors/RegexDetectors";
import type { OCRResult, VisualElement, PrivacyRedaction, VisualContext } from "../vision/VisualContext";

export function detectVisualPrivacy(
  ocr: OCRResult[],
  elements: VisualElement[]
): PrivacyRedaction[] {
  const redactions: PrivacyRedaction[] = [];

  // 1. Detect PII in OCR text
  for (const block of ocr) {
    const match = detectTextPatterns(block.text);
    if (match) {
      redactions.push({
        category: `[${match.category} REDACTED]`,
        bbox: block.bbox,
        confidence: match.confidence,
      });
    }
  }

  // 2. Detect Sensitive Visual Objects (Faces, Cards, etc.)
  for (const el of elements) {
    const lowerType = el.type.toLowerCase();
    // Assuming our object detector outputs labels like 'face', 'person', 'credit card'
    if (lowerType.includes("face") || lowerType.includes("person")) {
      redactions.push({
        category: "[FACE REDACTED]",
        bbox: el.bbox,
        confidence: el.confidence,
      });
    }
    if (lowerType.includes("card") || lowerType.includes("document") || lowerType.includes("passport")) {
      redactions.push({
        category: "[DOCUMENT REDACTED]",
        bbox: el.bbox,
        confidence: el.confidence,
      });
    }
  }

  return redactions;
}

/**
 * Apply Visual Privacy Detection to the context, adding redactions.
 */
export function applyVisualPrivacy(context: VisualContext): VisualContext {
  const newRedactions = detectVisualPrivacy(context.ocr, context.elements);
  
  // Also redact the OCR text strings themselves in the context
  const sanitizedOcr = context.ocr.map(block => {
    const match = detectTextPatterns(block.text);
    if (match) {
      return {
        ...block,
        text: `[${match.category}]`
      };
    }
    return block;
  });

  return {
    ...context,
    ocr: sanitizedOcr,
    redactions: [...context.redactions, ...newRedactions]
  };
}
