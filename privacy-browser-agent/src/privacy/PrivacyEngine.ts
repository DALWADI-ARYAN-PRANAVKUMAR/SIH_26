import type { PageContext } from "@/types";
import { PrivacyFinding, SanitizedPageContext, PrivacyMetadata } from "./types";
import { detectTextPatterns, redactText } from "./detectors/RegexDetectors";
import { detectInputSensitivities } from "./detectors/DOMDetectors";

import { applyVisualPrivacy } from "./VisualPrivacyDetector";
import { redactScreenshot } from "./VisualRedactor";

export class PrivacyEngine {
  /**
   * Main entry point to sanitize a PageContext before it goes to the backend.
   */
  public static async sanitize(context: PageContext): Promise<SanitizedPageContext> {
    const startTime = performance.now();
    
    const findings: PrivacyFinding[] = [];
    let elementsInspected = 0;
    let elementsRedacted = 0;

    // 1. Clone context structure
    const sanitizedElements = {
      inputs: [] as any[],
      buttons: [] as any[],
      links: [] as any[],
      forms: [] as any[],
      selects: [] as any[],
      checkboxes: [] as any[],
    };

    const sanitizedText: string[] = [];
    const sanitizedHeadings: any[] = [];

    // --- PROCESS TEXT BLOCKS ---
    for (const textBlock of context.text) {
      elementsInspected++;
      const { redactedText, foundCategories } = redactText(textBlock);
      sanitizedText.push(redactedText);
      
      if (foundCategories.size > 0) {
        elementsRedacted++;
        for (const cat of foundCategories) {
          findings.push({
            classification: "SENSITIVE", // general fallback
            category: cat,
            confidence: 0.9,
            action: "REDACT",
            reason: "Regex pattern match",
          });
        }
      }
    }

    // --- PROCESS HEADINGS ---
    for (const heading of context.headings) {
      elementsInspected++;
      const { redactedText, foundCategories } = redactText(heading.text);
      sanitizedHeadings.push({ ...heading, text: redactedText });
      
      if (foundCategories.size > 0) {
        elementsRedacted++;
        for (const cat of foundCategories) {
          findings.push({
            classification: "SENSITIVE",
            category: cat,
            confidence: 0.9,
            action: "REDACT",
            reason: "Regex pattern match in heading",
          });
        }
      }
    }

    // --- PROCESS ELEMENTS (Inputs) ---
    for (const input of (context.elements.inputs || [])) {
      elementsInspected++;
      let isSensitive = false;
      let redactedInput = { ...input };

      // Check DOM heuristics
      const domDetect = detectInputSensitivities(
        input.inputType || "",
        input.name || "",
        input.placeholder || "",
        input.ariaLabel || "",
        (input as any).autocomplete || ""
      );

      if (domDetect) {
        isSensitive = true;
        redactedInput.value = `[${domDetect.category}]`;
        if (redactedInput.placeholder && redactedInput.placeholder.trim()) {
           // Safely redact placeholder too just in case it contained the value
           redactedInput.placeholder = `[${domDetect.category}]`;
        }
        
        findings.push({
          elementId: input.id,
          classification: domDetect.classification,
          category: domDetect.category,
          confidence: domDetect.confidence,
          action: "REDACT",
          reason: domDetect.reason,
        });
      }

      // Check value pattern directly
      if (!isSensitive && input.value && input.value !== "[REDACTED]") {
        const valDetect = detectTextPatterns(input.value);
        if (valDetect) {
          isSensitive = true;
          redactedInput.value = `[${valDetect.category}]`;
          findings.push({
            elementId: input.id,
            classification: valDetect.classification,
            category: valDetect.category,
            confidence: valDetect.confidence,
            action: "REDACT",
            reason: "Regex pattern match in input value",
          });
        }
      }

      if (isSensitive) elementsRedacted++;
      sanitizedElements.inputs.push(redactedInput);
    }

    // --- PROCESS ELEMENTS (Buttons, Links, Forms, Selects, Checkboxes) ---
    // Generally public text, but we regex redact just in case
    for (const btn of (context.elements.buttons || [])) {
      elementsInspected++;
      const { redactedText } = redactText(btn.text || "");
      sanitizedElements.buttons.push({ ...btn, text: redactedText });
    }
    
    for (const link of (context.elements.links || [])) {
      elementsInspected++;
      const { redactedText } = redactText(link.text || "");
      sanitizedElements.links.push({ ...link, text: redactedText });
    }

    for (const form of (context.elements.forms || [])) {
      elementsInspected++;
      sanitizedElements.forms.push(form); // forms don't have text directly
    }

    for (const select of (context.elements.selects || [])) {
      elementsInspected++;
      sanitizedElements.selects.push(select);
    }

    for (const checkbox of (context.elements.checkboxes || [])) {
      elementsInspected++;
      sanitizedElements.checkboxes.push(checkbox);
    }

    let finalVisual = undefined;

    if (context.visual) {
      elementsInspected++;
      // 1. Detect and apply text/element redactions to the visual context
      const visualWithRedactions = applyVisualPrivacy(context.visual);
      
      // 2. Add visual privacy findings to the overall findings list
      for (const red of visualWithRedactions.redactions) {
        findings.push({
          classification: "SENSITIVE",
          category: red.category as any,
          confidence: red.confidence,
          action: "REDACT",
          reason: "Visual Object/Text Pattern Match",
        });
        elementsRedacted++;
      }

      // 3. Actually censor the image pixels
      if (context.visual.rawScreenshotBase64) {
        finalVisual = await redactScreenshot(
          context.visual.rawScreenshotBase64,
          visualWithRedactions
        );
        // Do not send raw screenshot
        delete finalVisual.rawScreenshotBase64;
      } else {
        finalVisual = visualWithRedactions;
      }
    }

    const duration = performance.now() - startTime;
    
    const status = findings.length > 0 ? "PROTECTED" : "NO_SENSITIVE_DATA_FOUND";

    const privacyMetadata: PrivacyMetadata = {
      findings,
      elementsInspected,
      sensitiveElementsDetected: elementsRedacted,
      elementsRedacted,
      scanDurationMs: Math.round(duration),
      status,
    };

    const sanitizedContext: SanitizedPageContext = {
      page: { ...context.page },
      elements: sanitizedElements,
      text: sanitizedText,
      headings: sanitizedHeadings,
      visual: finalVisual,
      privacy: privacyMetadata,
      timestamp: context.timestamp,
      isSanitized: true,
    };

    return sanitizedContext;
  }
}
