/**
 * ActionExecutor.ts
 * Receives structured actions and safely executes them in the DOM.
 */

import { globalRegistry } from "@/perception/ElementRegistry";
import type { AgentAction, ActionVerification } from "@/types";

export async function executeDOMAction(action: AgentAction): Promise<ActionVerification> {
  try {
    switch (action.action) {
      case "click":
        return await handleClick(action.target.elementId);
      case "type":
        return await handleType(action.target.elementId, action.value);
      case "select":
        return await handleSelect(action.target.elementId, action.value);
      case "scroll":
        return await handleScroll(action.direction, action.amount);
      case "wait":
        await new Promise(r => setTimeout(r, action.milliseconds));
        return { success: true, action: "wait" };
      default:
        return { success: false, action: action.action, errorCode: "UNSUPPORTED_ACTION" };
    }
  } catch (err: any) {
    return { success: false, action: action.action, errorCode: err.message };
  }
}

async function handleClick(elementId: string): Promise<ActionVerification> {
  const el = globalRegistry.getElement(elementId);
  if (!el || !(el instanceof HTMLElement)) {
    return { success: false, action: "click", elementId, errorCode: "ELEMENT_NOT_FOUND" };
  }
  
  if ((el as any).disabled) {
    return { success: false, action: "click", elementId, errorCode: "ELEMENT_DISABLED" };
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Wait for scroll
  await new Promise(r => setTimeout(r, 300));

  el.click();
  return { success: true, action: "click", elementId };
}

async function handleType(elementId: string, value: string): Promise<ActionVerification> {
  const el = globalRegistry.getElement(elementId);
  if (!el || !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return { success: false, action: "type", elementId, errorCode: "ELEMENT_NOT_FOUND_OR_INVALID_TYPE" };
  }
  
  if (el.disabled || el.readOnly) {
    return { success: false, action: "type", elementId, errorCode: "ELEMENT_DISABLED_OR_READONLY" };
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await new Promise(r => setTimeout(r, 300));

  el.focus();
  el.value = value;
  
  // Dispatch events so React/Vue/Angular pick up the change
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));

  return { success: true, action: "type", elementId };
}

async function handleSelect(elementId: string, value: string): Promise<ActionVerification> {
  const el = globalRegistry.getElement(elementId);
  if (!el || !(el instanceof HTMLSelectElement)) {
    return { success: false, action: "select", elementId, errorCode: "ELEMENT_NOT_FOUND_OR_INVALID_TYPE" };
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await new Promise(r => setTimeout(r, 300));

  // Find option
  let found = false;
  for (let i = 0; i < el.options.length; i++) {
    if (el.options[i].value === value || el.options[i].text === value) {
      el.selectedIndex = i;
      found = true;
      break;
    }
  }

  if (!found) {
    return { success: false, action: "select", elementId, errorCode: "OPTION_NOT_FOUND" };
  }

  el.dispatchEvent(new Event('change', { bubbles: true }));
  return { success: true, action: "select", elementId };
}

async function handleScroll(direction: string, amount: number = 500): Promise<ActionVerification> {
  if (direction === "down") window.scrollBy({ top: amount, behavior: 'smooth' });
  else if (direction === "up") window.scrollBy({ top: -amount, behavior: 'smooth' });
  else if (direction === "left") window.scrollBy({ left: -amount, behavior: 'smooth' });
  else if (direction === "right") window.scrollBy({ left: amount, behavior: 'smooth' });

  await new Promise(r => setTimeout(r, 500));
  return { success: true, action: "scroll" };
}
