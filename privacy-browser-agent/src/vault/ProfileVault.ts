/**
 * ProfileVault.ts
 * Manages secure on-device storage for user profile data.
 * Used for autonomous form filling with ZERO cloud leakage.
 */

import type { PageContext, AgentPlan, AgentAction } from "@/types";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
  aadhaar: string;
  pan: string;
  card: string;
  apiKey: string;
  from: string;
  to: string;
  country: string;
}

export const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  phone: "",
  password: "",
  otp: "",
  aadhaar: "",
  pan: "",
  card: "",
  apiKey: "",
  from: "",
  to: "",
  country: "",
};

// Kept for backward-compatibility or quick testing if desired
export const DEFAULT_PROFILE = EMPTY_PROFILE;

const VAULT_STORAGE_KEY = "privacy_agent_user_vault";

/**
 * Check if the user has stored any values in the vault.
 */
export function hasVaultData(vault: UserProfile): boolean {
  return Object.values(vault).some((val) => typeof val === "string" && val.trim().length > 0);
}

/**
 * Load user profile from chrome.storage.local (defaults to empty strings).
 */
export async function loadProfileVault(): Promise<UserProfile> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return { ...EMPTY_PROFILE };
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(VAULT_STORAGE_KEY, (result) => {
      if (result && result[VAULT_STORAGE_KEY]) {
        resolve({ ...EMPTY_PROFILE, ...result[VAULT_STORAGE_KEY] });
      } else {
        resolve({ ...EMPTY_PROFILE });
      }
    });
  });
}

/**
 * Save user profile to chrome.storage.local.
 */
export async function saveProfileVault(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = await loadProfileVault();
  const updated: UserProfile = { ...current, ...profile };

  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: updated });
  }

  return updated;
}

/**
 * Clear user profile vault.
 */
export async function clearProfileVault(): Promise<UserProfile> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: EMPTY_PROFILE });
  }
  return { ...EMPTY_PROFILE };
}

/**
 * Check whether a task prompt is an extract/import command.
 */
export function isExtractIntent(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const keywords = [
    "extract",
    "import",
    "get data",
    "get the data",
    "save details",
    "save data",
    "remember this",
    "store data",
    "scan page",
  ];
  return keywords.some((k) => lower.includes(k));
}

/**
 * Extract personal profile fields directly from page text on-device.
 */
export function extractProfileFromPageText(text: string): Partial<UserProfile> {
  const extracted: Partial<UserProfile> = {};

  // 1. Email
  const emailMatch = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
  if (emailMatch) extracted.email = emailMatch[0];

  // 2. Phone (+91 or standard 10-digit Indian phone)
  const phoneMatch = text.match(/(?:\+91\s*)?[6789]\d{9}\b/);
  if (phoneMatch) extracted.phone = phoneMatch[0];

  // 3. PAN (e.g. ABCDE1234F)
  const panMatch = text.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/);
  if (panMatch) extracted.pan = panMatch[0];

  // 4. Credit Card (16 digits: 4 groups of 4)
  const cardMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/);
  if (cardMatch) extracted.card = cardMatch[0];

  // 5. Aadhaar (12 digits: 3 groups of 4, distinct from card)
  const aadhaarMatches = text.matchAll(/\b([2-9]\d{3}\s\d{4}\s\d{4})\b/g);
  for (const match of aadhaarMatches) {
    const cand = match[1];
    if (extracted.card && extracted.card.includes(cand)) {
      continue; // Skip if it's the prefix of the 16-digit card
    }
    extracted.aadhaar = cand;
    break;
  }

  // 6. Name (e.g. "Name: Aryan Dalwadi" or "CARDHOLDER: ARYAN D.")
  const nameMatch = text.match(/(?:Full\s*)?Name[\s:]+([A-Za-z\s]+?)(?:\s*(?:DOB|Gender|Father|Mera|$|\n))/i);
  if (nameMatch) {
    const candName = nameMatch[1].trim();
    if (candName && candName.length > 2 && !candName.toLowerCase().startsWith("enter")) {
      extracted.name = candName;
    }
  }

  // 7. OTP (6-digit code)
  const otpMatch = text.match(/(?:Verification Code|OTP)[\s:]*([0-9]{6})/i);
  if (otpMatch) extracted.otp = otpMatch[1];

  // 8. API Key
  const apiMatch = text.match(/\bsk-[a-zA-Z0-9_-]{20,}\b/);
  if (apiMatch) extracted.apiKey = apiMatch[0];

  return extracted;
}

/**
 * Check whether a task prompt is an autofill command.
 */
export function isAutofillIntent(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const keywords = [
    "autofill",
    "fill form",
    "fill this form",
    "fill my",
    "fill details",
    "fill in my details",
    "fill profile",
    "fill info",
    "fill information",
    "fill data",
    "populate form",
    "complete form",
  ];
  return keywords.some((k) => lower.includes(k));
}

/**
 * Generate an action plan to autofill the current page using local vault data.
 * Purely on-device heuristic matching — never contacts the cloud.
 */
export function generateVaultAutofillPlan(
  pageContext: PageContext,
  vault: UserProfile
): AgentPlan {
  if (!hasVaultData(vault)) {
    return {
      type: "action_plan",
      message: "Your Privacy Vault is currently empty. Please open the 'Vault' tab in the side panel to enter your details, then try again.",
      actions: [],
      requiresConfirmation: false,
    };
  }

  const actions: AgentAction[] = [];
  const matchedFields: string[] = [];

  const inputs = pageContext.elements.inputs || [];
  const selects = pageContext.elements.selects || [];

  for (const input of inputs) {
    if (input.disabled) continue;

    const meta = [
      input.name || "",
      input.placeholder || "",
      input.ariaLabel || "",
      input.inputType || "",
      input.id || "",
    ]
      .join(" ")
      .toLowerCase();

    let targetValue = "";
    let fieldName = "";

    // 1. Password
    if (input.inputType === "password" || meta.includes("password") || meta.includes("pwd")) {
      targetValue = vault.password;
      fieldName = "Password";
    }
    // 2. OTP
    else if (meta.includes("otp") || meta.includes("verification code") || meta.includes("security code")) {
      targetValue = vault.otp;
      fieldName = "OTP";
    }
    // 3. Aadhaar
    else if (meta.includes("aadhaar") || meta.includes("uidai")) {
      targetValue = vault.aadhaar;
      fieldName = "Aadhaar";
    }
    // 4. PAN
    else if (meta.includes("pan") || meta.includes("tax id")) {
      targetValue = vault.pan;
      fieldName = "PAN";
    }
    // 5. Credit / Debit Card
    else if (meta.includes("card") || meta.includes("cc-number") || meta.includes("credit card")) {
      targetValue = vault.card;
      fieldName = "Card Number";
    }
    // 6. API Key
    else if (meta.includes("api") || meta.includes("token") || meta.includes("secret")) {
      targetValue = vault.apiKey;
      fieldName = "API Key";
    }
    // 7. Email
    else if (input.inputType === "email" || meta.includes("email") || meta.includes("mail")) {
      targetValue = vault.email;
      fieldName = "Email";
    }
    // 8. Phone
    else if (input.inputType === "tel" || meta.includes("phone") || meta.includes("mobile") || meta.includes("contact")) {
      targetValue = vault.phone;
      fieldName = "Phone";
    }
    // 9. Departure City / From
    else if (meta.includes("from") || meta.includes("departure") || meta.includes("origin")) {
      targetValue = vault.from;
      fieldName = "Departure";
    }
    // 10. Destination City / To
    else if (meta.includes("to") || meta.includes("destination") || meta.includes("arrival")) {
      targetValue = vault.to;
      fieldName = "Destination";
    }
    // 11. Name
    else if (meta.includes("name") || meta.includes("passenger") || meta.includes("user")) {
      targetValue = vault.name;
      fieldName = "Name";
    }

    if (targetValue && targetValue.trim() && input.id) {
      actions.push({
        action: "type",
        target: { elementId: input.id },
        value: targetValue.trim(),
      });
      matchedFields.push(fieldName);
    }
  }

  // Handle select dropdowns (e.g. Country)
  for (const select of selects) {
    if (select.disabled) continue;
    const meta = [select.name || "", select.id || ""].join(" ").toLowerCase();

    if (meta.includes("country") && select.id && vault.country && vault.country.trim()) {
      actions.push({
        action: "select",
        target: { elementId: select.id },
        value: vault.country.trim(),
      });
      matchedFields.push("Country");
    }
  }

  if (actions.length === 0) {
    return {
      type: "action_plan",
      message: "No matching fields could be autofilled with your current vault data. Please check that your details are saved in the Vault tab.",
      actions: [],
      requiresConfirmation: false,
    };
  }

  return {
    type: "action_plan",
    message: `Autofilling ${actions.length} fields from your local vault (${Array.from(new Set(matchedFields)).join(", ")}) with zero cloud exposure.`,
    actions,
    requiresConfirmation: false,
  };
}
