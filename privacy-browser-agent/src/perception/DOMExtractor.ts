/**
 * DOMExtractor.ts
 * Extracts structured PageContext from the current DOM.
 */

import type {
  PageContext,
  InputElement
} from "@/types";
import { isElementVisible } from "./VisibilityDetector";
import { globalRegistry } from "./ElementRegistry";
import { isIrrelevantNoise } from "./PageCleaner";

function getAccessibleName(el: Element): string {
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel.trim();
  
  if (el instanceof HTMLInputElement && (el.type === "submit" || el.type === "button")) {
    return el.value.trim();
  }
  
  // Basic inner text
  const text = (el as HTMLElement).innerText || el.textContent;
  return text ? text.trim() : "";
}

export function extractPageContext(): PageContext {
  globalRegistry.clear();

  const context: PageContext = {
    page: {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      language: document.documentElement.lang || "en"
    },
    headings: [],
    text: [],
    elements: {
      buttons: [],
      links: [],
      inputs: [],
      selects: [],
      checkboxes: [],
      forms: []
    },
    timestamp: Date.now()
  };

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (isIrrelevantNoise(el) || !isElementVisible(el)) {
            return NodeFilter.FILTER_REJECT;
          }
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node: Node | null;
  
  // Track text blocks to avoid spam
  let currentTextBlock: string[] = [];
  const flushText = () => {
    if (currentTextBlock.length > 0) {
      const joined = currentTextBlock.join(" ").trim();
      if (joined.length > 0) {
        context.text.push(joined);
      }
      currentTextBlock = [];
    }
  };

  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        currentTextBlock.push(text);
      }
      continue;
    }

    const el = node as Element;
    const tag = el.tagName;

    // Block-level or interactive elements break text flow
    if (["P", "DIV", "BR", "H1", "H2", "H3", "H4", "H5", "H6", "BUTTON", "A", "FORM"].includes(tag)) {
      flushText();
    }

    if (tag.match(/^H[1-6]$/)) {
      context.headings.push({
        level: parseInt(tag.charAt(1)),
        text: getAccessibleName(el)
      });
      continue;
    }

    if (tag === "FORM") {
      const formEl = el as HTMLFormElement;
      context.elements.forms.push({
        id: globalRegistry.register(el, "form"),
        name: formEl.name || formEl.getAttribute("aria-label"),
        action: formEl.action
      });
      continue;
    }

    if (tag === "BUTTON" || el.getAttribute("role") === "button") {
      context.elements.buttons.push({
        id: globalRegistry.register(el, "button"),
        type: "button",
        text: getAccessibleName(el),
        ariaLabel: el.getAttribute("aria-label"),
        role: el.getAttribute("role"),
        title: el.getAttribute("title"),
        disabled: (el as HTMLButtonElement).disabled
      });
      continue;
    }

    if (tag === "A") {
      context.elements.links.push({
        id: globalRegistry.register(el, "link"),
        type: "link",
        text: getAccessibleName(el),
        ariaLabel: el.getAttribute("aria-label"),
        href: (el as HTMLAnchorElement).href,
        title: el.getAttribute("title")
      });
      continue;
    }

    if (tag === "INPUT" || tag === "TEXTAREA") {
      const inputEl = el as HTMLInputElement;
      const type = tag === "TEXTAREA" ? "textarea" : inputEl.type.toLowerCase();
      
      const baseInput: InputElement = {
        id: globalRegistry.register(el, "input"),
        type: tag.toLowerCase(),
        inputType: type,
        name: inputEl.name || el.getAttribute("aria-label"),
        placeholder: inputEl.placeholder,
        disabled: inputEl.disabled,
        required: inputEl.required,
      };

      if (type === "password") {
        baseInput.hasValue = inputEl.value.length > 0;
        baseInput.value = "[REDACTED]";
      } else if (type === "checkbox" || type === "radio") {
        baseInput.checked = inputEl.checked;
        if (type === "checkbox") {
          context.elements.checkboxes.push(baseInput);
          continue;
        }
      } else {
        baseInput.hasValue = inputEl.value.length > 0;
        baseInput.value = inputEl.value; // In phase 2, non-passwords are sent. PII redaction later.
      }

      context.elements.inputs.push(baseInput);
      continue;
    }

    if (tag === "SELECT") {
      const selectEl = el as HTMLSelectElement;
      const options = Array.from(selectEl.options).map(opt => ({
        text: opt.text,
        value: opt.value,
        selected: opt.selected
      }));
      
      context.elements.selects.push({
        id: globalRegistry.register(el, "select"),
        type: "select",
        name: selectEl.name || el.getAttribute("aria-label"),
        disabled: selectEl.disabled,
        options
      });
      continue;
    }
  }

  flushText();

  // Compress text: remove duplicates or overly long nonsense
  context.text = Array.from(new Set(context.text)).filter(t => t.length > 1 && t.length < 2000);

  return context;
}
