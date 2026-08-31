import { PrivacyCategory, PrivacyClassification } from "../types";

export interface PatternRule {
  category: PrivacyCategory;
  classification: PrivacyClassification;
  regex: RegExp;
  confidence: number;
}

export const PATTERNS: PatternRule[] = [
  // High confidence financial / ID patterns
  {
    category: "CREDIT_CARD",
    classification: "HIGHLY_SENSITIVE",
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    confidence: 0.9,
  },
  {
    category: "AADHAAR",
    classification: "HIGHLY_SENSITIVE",
    regex: /\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b/g,
    confidence: 0.85,
  },
  {
    category: "PAN",
    classification: "HIGHLY_SENSITIVE",
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    confidence: 0.95,
  },
  {
    category: "IFSC",
    classification: "SENSITIVE",
    regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    confidence: 0.85,
  },
  {
    category: "UPI",
    classification: "SENSITIVE",
    regex: /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g,
    confidence: 0.8,
  },
  {
    category: "EMAIL",
    classification: "PERSONAL",
    regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    confidence: 0.95,
  },
  {
    category: "PHONE",
    classification: "PERSONAL",
    regex: /\b(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}\b/g,
    confidence: 0.75, // Lower confidence as 10 digits can be anything
  },
  {
    category: "API_KEY",
    classification: "HIGHLY_SENSITIVE",
    regex: /\b(?:sk-[a-zA-Z0-9]{20,}|[a-zA-Z0-9]{32,}|Bearer\s+[a-zA-Z0-9\-\._~+\/]+=*)\b/g,
    confidence: 0.85,
  },
];

export function detectTextPatterns(text: string): { category: PrivacyCategory, classification: PrivacyClassification, confidence: number } | null {
  if (!text) return null;
  
  let bestMatch = null;
  
  for (const pattern of PATTERNS) {
    if (pattern.regex.test(text)) {
      if (!bestMatch || pattern.confidence > bestMatch.confidence) {
        bestMatch = {
          category: pattern.category,
          classification: pattern.classification,
          confidence: pattern.confidence,
        };
      }
    }
    pattern.regex.lastIndex = 0; // reset
  }
  
  return bestMatch;
}

export function redactText(text: string): { redactedText: string, foundCategories: Set<PrivacyCategory> } {
  if (!text) return { redactedText: "", foundCategories: new Set() };
  let result = text;
  const foundCategories = new Set<PrivacyCategory>();
  
  for (const pattern of PATTERNS) {
    if (pattern.regex.test(result)) {
      result = result.replace(pattern.regex, `[${pattern.category}]`);
      foundCategories.add(pattern.category);
    }
    pattern.regex.lastIndex = 0;
  }
  
  return { redactedText: result, foundCategories };
}
