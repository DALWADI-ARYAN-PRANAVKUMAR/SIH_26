export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResult {
  text: string;
  bbox: BoundingBox;
  confidence: number;
}

export interface VisualElement {
  id: string; // e.g., visual_button_001
  type: string; // e.g., "button", "input", "image"
  label?: string;
  bbox: BoundingBox;
  confidence: number;
}

export interface PrivacyRedaction {
  category: string; // e.g., [CARD REDACTED]
  bbox: BoundingBox;
  confidence: number;
}

export interface VisualContext {
  viewport: {
    width: number;
    height: number;
  };
  ocr: OCRResult[];
  elements: VisualElement[];
  redactions: PrivacyRedaction[];
  timestamp: number;
  rawScreenshotBase64?: string;
}

export interface SanitizedVisualContext extends VisualContext {
  sanitizedScreenshotBase64?: string; // Optional image sent to VLM
}
