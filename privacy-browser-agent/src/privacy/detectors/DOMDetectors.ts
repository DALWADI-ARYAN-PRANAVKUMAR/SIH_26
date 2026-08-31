import { PrivacyCategory, PrivacyClassification } from "../types";

export function detectInputSensitivities(
  type: string,
  name: string,
  placeholder: string,
  ariaLabel: string,
  autocomplete: string
): { category: PrivacyCategory, classification: PrivacyClassification, confidence: number, reason: string } | null {
  const t = type.toLowerCase();
  const meta = [name, placeholder, ariaLabel, autocomplete].join(" ").toLowerCase();

  // 1. Password
  if (t === "password" || meta.includes("password") || meta.includes("passwd") || meta.includes("pwd") || autocomplete.includes("current-password")) {
    return { category: "PASSWORD", classification: "HIGHLY_SENSITIVE", confidence: 0.99, reason: "Password field detected" };
  }

  // 2. OTP
  if (meta.includes("otp") || meta.includes("one-time password") || meta.includes("verification code") || meta.includes("security code")) {
    return { category: "OTP", classification: "HIGHLY_SENSITIVE", confidence: 0.9, reason: "OTP field detected" };
  }

  // 3. API Key / Token
  if (meta.includes("api key") || meta.includes("token") || meta.includes("secret key")) {
    return { category: "API_KEY", classification: "HIGHLY_SENSITIVE", confidence: 0.85, reason: "API key / token field detected" };
  }

  // 4. Credit Card
  if (meta.includes("card number") || meta.includes("cc-number") || meta.includes("credit card") || meta.includes("debit card") || autocomplete.includes("cc-number")) {
    return { category: "CREDIT_CARD", classification: "HIGHLY_SENSITIVE", confidence: 0.9, reason: "Credit card field detected" };
  }

  // CVV
  if (meta.includes("cvv") || meta.includes("cvc") || meta.includes("security code") || autocomplete.includes("cc-csc")) {
    return { category: "CREDIT_CARD", classification: "HIGHLY_SENSITIVE", confidence: 0.9, reason: "Credit card security code detected" };
  }

  // 5. Aadhaar
  if (meta.includes("aadhaar") || meta.includes("uidai")) {
    return { category: "AADHAAR", classification: "HIGHLY_SENSITIVE", confidence: 0.9, reason: "Aadhaar field detected" };
  }

  // 6. PAN
  if (meta.includes("pan number") || meta.includes("pan card") || (name === "pan")) {
    return { category: "PAN", classification: "HIGHLY_SENSITIVE", confidence: 0.9, reason: "PAN field detected" };
  }

  // 7. UPI
  if (meta.includes("upi id") || meta.includes("vpa")) {
    return { category: "UPI", classification: "SENSITIVE", confidence: 0.85, reason: "UPI ID field detected" };
  }

  // 8. Bank Account / IFSC
  if (meta.includes("account number") || meta.includes("bank account")) {
    return { category: "BANK_ACCOUNT", classification: "HIGHLY_SENSITIVE", confidence: 0.85, reason: "Bank account field detected" };
  }
  if (meta.includes("ifsc")) {
    return { category: "IFSC", classification: "SENSITIVE", confidence: 0.85, reason: "IFSC field detected" };
  }

  // 9. Email
  if (t === "email" || meta.includes("email") || autocomplete.includes("email")) {
    return { category: "EMAIL", classification: "PERSONAL", confidence: 0.9, reason: "Email field detected" };
  }

  // 10. Phone
  if (t === "tel" || meta.includes("phone") || meta.includes("mobile") || meta.includes("contact number") || autocomplete.includes("tel")) {
    return { category: "PHONE", classification: "PERSONAL", confidence: 0.85, reason: "Phone number field detected" };
  }

  // 11. Name
  if (meta.includes("full name") || meta.includes("first name") || meta.includes("last name") || autocomplete.includes("name")) {
    return { category: "NAME", classification: "PERSONAL", confidence: 0.8, reason: "Name field detected" };
  }

  return null;
}
