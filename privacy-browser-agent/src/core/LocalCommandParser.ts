/**
 * LocalCommandParser.ts
 * On-Device Rule-Based Action Parser.
 *
 * Allows the Privacy Browser Agent to immediately execute natural language actions
 * (e.g. "type 123456 in the OTP field", "click Submit", "select India in country")
 * purely on-device without consuming cloud LLM API quota or exposing private data.
 */

import type { PageContext, AgentPlan, AgentAction } from "@/types";

export function parseLocalCommand(
  prompt: string,
  pageContext: PageContext
): AgentPlan | null {
  const actions: AgentAction[] = [];
  const cleanPrompt = prompt.trim();
  const lowerPrompt = cleanPrompt.toLowerCase();

  const inputs = pageContext.elements.inputs || [];
  const buttons = pageContext.elements.buttons || [];
  const links = pageContext.elements.links || [];
  const selects = pageContext.elements.selects || [];

  // -------------------------------------------------------------
  // 1. SCROLL ACTIONS
  // -------------------------------------------------------------
  if (lowerPrompt === "scroll down" || lowerPrompt.includes("scroll to bottom")) {
    return {
      type: "action_plan",
      message: "Scrolling down the page (on-device action).",
      actions: [{ action: "scroll", direction: "down", amount: 600 }],
      requiresConfirmation: false,
    };
  }
  if (lowerPrompt === "scroll up" || lowerPrompt.includes("scroll to top")) {
    return {
      type: "action_plan",
      message: "Scrolling up the page (on-device action).",
      actions: [{ action: "scroll", direction: "up", amount: 600 }],
      requiresConfirmation: false,
    };
  }

  // -------------------------------------------------------------
  // 2. TYPE ACTIONS
  // Match patterns like:
  // - "type 123456 in the OTP field"
  // - "type Aryan in name and click submit"
  // - "fill user@example.com in email"
  // - "enter Mumbai into departure"
  // -------------------------------------------------------------
  const typeRegex = /(?:type|fill|enter|put|write)\s+["']?([^"']+?)["']?\s+(?:in|into)\s+(?:the\s+)?([a-zA-Z0-9_\s\-]+?)(?:\s+field|\s+input|\s+box|\s+and|\s*,|$)/gi;
  let typeMatch: RegExpExecArray | null;

  while ((typeMatch = typeRegex.exec(cleanPrompt)) !== null) {
    const rawVal = typeMatch[1].trim();
    const rawTarget = typeMatch[2].trim().toLowerCase();

    // Find best matching input element
    const targetInput = findMatchingInput(rawTarget, inputs);
    if (targetInput && targetInput.id) {
      actions.push({
        action: "type",
        target: { elementId: targetInput.id },
        value: rawVal,
      });
    }
  }

  // Also support reverse pattern: "fill (the)? <field> with <value>"
  // e.g. "fill the OTP field with 123456"
  const reverseTypeRegex = /(?:fill|populate)\s+(?:the\s+)?([a-zA-Z0-9_\s\-]+?)(?:\s+field|\s+input|\s+box)?\s+with\s+["']?([^"']+?)["']?(?:\s+and|\s*,|$)/gi;
  let revMatch: RegExpExecArray | null;
  while ((revMatch = reverseTypeRegex.exec(cleanPrompt)) !== null) {
    const rawTarget = revMatch[1].trim().toLowerCase();
    const rawVal = revMatch[2].trim();

    const targetInput = findMatchingInput(rawTarget, inputs);
    if (targetInput && targetInput.id) {
      // Avoid duplicate action for same element
      if (!actions.some((a) => a.action === "type" && a.target?.elementId === targetInput.id)) {
        actions.push({
          action: "type",
          target: { elementId: targetInput.id },
          value: rawVal,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 3. SELECT ACTIONS
  // e.g. "select India in country"
  // -------------------------------------------------------------
  const selectRegex = /select\s+["']?([^"']+?)["']?\s+(?:in|from|for)\s+(?:the\s+)?([a-zA-Z0-9_\s\-]+?)(?:\s+dropdown|\s+select|\s+and|\s*,|$)/gi;
  let selMatch: RegExpExecArray | null;
  while ((selMatch = selectRegex.exec(cleanPrompt)) !== null) {
    const rawVal = selMatch[1].trim();
    const rawTarget = selMatch[2].trim().toLowerCase();

    const targetSelect = selects.find((s) => {
      const meta = [s.name || "", s.id || ""].join(" ").toLowerCase();
      return meta.includes(rawTarget);
    });

    if (targetSelect && targetSelect.id) {
      actions.push({
        action: "select",
        target: { elementId: targetSelect.id },
        value: rawVal,
      });
    }
  }

  // -------------------------------------------------------------
  // 4. CLICK ACTIONS
  // e.g. "click Submit", "click on the Submit button", "press Search"
  // -------------------------------------------------------------
  const clickRegex = /(?:click|press|tap|hit)\s+(?:on\s+)?(?:the\s+)?([a-zA-Z0-9_\s\-]+?)(?:\s+button|\s+btn|\s+link|\s+and|\s*,|$)/gi;
  let clickMatch: RegExpExecArray | null;
  while ((clickMatch = clickRegex.exec(cleanPrompt)) !== null) {
    const rawTarget = clickMatch[1].trim().toLowerCase();

    const targetBtn = findMatchingClickable(rawTarget, buttons, links);
    if (targetBtn && targetBtn.id) {
      actions.push({
        action: "click",
        target: { elementId: targetBtn.id },
      });
    }
  }

  // Bare click / submit e.g. "submit the form" or just "click submit"
  if (actions.length === 0 && (lowerPrompt.includes("submit form") || lowerPrompt === "submit")) {
    const submitBtn = buttons.find((b) => {
      const text = (b.text || "").toLowerCase();
      return text.includes("submit") || text.includes("confirm");
    });
    if (submitBtn && submitBtn.id) {
      actions.push({
        action: "click",
        target: { elementId: submitBtn.id },
      });
    }
  }

  if (actions.length === 0) {
    return null; // Let the cloud planner handle more complex / ambiguous phrasing
  }

  const descriptions = actions.map((a) => {
    if (a.action === "type") return `type "${a.value}"`;
    if (a.action === "click") return `click`;
    if (a.action === "select") return `select "${a.value}"`;
    return a.action;
  });

  return {
    type: "action_plan",
    message: `On-Device Engine: ${descriptions.join(", ")} (instant, zero cloud quota).`,
    actions,
    requiresConfirmation: false,
  };
}

/**
 * Helper to match an input field by fuzzy target name against DOM metadata.
 */
function findMatchingInput(targetName: string, inputs: any[]): any | null {
  const target = targetName.trim().toLowerCase();

  // Exact match on name or ID first
  for (const input of inputs) {
    if (input.name && input.name.toLowerCase() === target) return input;
    if (input.id && input.id.toLowerCase() === target) return input;
  }

  // Synonym mapping
  const synonyms: Record<string, string[]> = {
    otp: ["otp", "code", "verification", "2fa", "one-time password"],
    name: ["name", "full_name", "passenger", "username", "first name"],
    email: ["email", "mail", "e-mail"],
    phone: ["phone", "mobile", "tel", "contact"],
    password: ["password", "pwd", "pass"],
    aadhaar: ["aadhaar", "uidai", "aadhar"],
    pan: ["pan", "tax"],
    card: ["card", "cc-number", "credit", "debit"],
    api: ["api", "token", "secret", "key"],
    from: ["from", "departure", "origin"],
    to: ["to", "destination", "arrival"],
  };

  for (const list of Object.values(synonyms)) {
    if (list.some((s) => target.includes(s))) {
      const found = inputs.find((inp) => {
        const meta = [
          inp.name || "",
          inp.placeholder || "",
          inp.ariaLabel || "",
          inp.id || "",
          inp.inputType || "",
        ]
          .join(" ")
          .toLowerCase();
        return list.some((s) => meta.includes(s));
      });
      if (found) return found;
    }
  }

  // General substring match across metadata
  for (const input of inputs) {
    const meta = [
      input.name || "",
      input.placeholder || "",
      input.ariaLabel || "",
      input.id || "",
    ]
      .join(" ")
      .toLowerCase();
    if (meta.includes(target) || target.includes(input.name?.toLowerCase() || "")) {
      return input;
    }
  }

  return null;
}

/**
 * Helper to match a button or link by text, label, or ID.
 */
function findMatchingClickable(targetName: string, buttons: any[], links: any[]): any | null {
  const target = targetName.trim().toLowerCase();

  // Search buttons
  for (const btn of buttons) {
    const text = (btn.text || "").toLowerCase();
    const aria = (btn.ariaLabel || "").toLowerCase();
    const id = (btn.id || "").toLowerCase();
    if (text.includes(target) || aria.includes(target) || id.includes(target)) {
      return btn;
    }
  }

  // Search links
  for (const link of links) {
    const text = (link.text || "").toLowerCase();
    const aria = (link.ariaLabel || "").toLowerCase();
    if (text.includes(target) || aria.includes(target)) {
      return link;
    }
  }

  return null;
}
