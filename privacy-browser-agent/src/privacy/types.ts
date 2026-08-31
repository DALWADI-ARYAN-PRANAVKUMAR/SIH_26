import type { PageContext } from "@/types";

export type PrivacyClassification = "PUBLIC" | "PERSONAL" | "SENSITIVE" | "HIGHLY_SENSITIVE" | "UNKNOWN";

export type PrivacyCategory =
  | "PASSWORD"
  | "OTP"
  | "EMAIL"
  | "PHONE"
  | "NAME"
  | "ADDRESS"
  | "AADHAAR"
  | "PAN"
  | "UPI"
  | "CREDIT_CARD"
  | "BANK_ACCOUNT"
  | "IFSC"
  | "API_KEY"
  | "TOKEN"
  | "PRIVATE_TEXT"
  | "OTHER";

export interface PrivacyFinding {
  elementId?: string;
  classification: PrivacyClassification;
  category: PrivacyCategory;
  confidence: number;
  action: "REDACT" | "MASK" | "ALLOW";
  reason: string;
}

export interface PrivacyMetadata {
  findings: PrivacyFinding[];
  elementsInspected: number;
  sensitiveElementsDetected: number;
  elementsRedacted: number;
  scanDurationMs: number;
  status: "PROTECTED" | "ERROR" | "NO_SENSITIVE_DATA_FOUND" | "BLOCKED";
}

export interface SanitizedPageContext extends Omit<PageContext, "elements" | "text" | "headings"> {
  elements: PageContext["elements"];
  text: string[];
  headings: PageContext["headings"];
  privacy: PrivacyMetadata;
  isSanitized: true; // Brand
}
