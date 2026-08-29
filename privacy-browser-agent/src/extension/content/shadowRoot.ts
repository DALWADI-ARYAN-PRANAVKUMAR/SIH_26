/**
 * Shadow Root — Attaches an open shadow DOM and injects Tailwind styles
 * inside it so that host-page CSS cannot leak in or out.
 */

import globalStyles from "@/styles/global.css?inline";

/**
 * CSS variables that must be available inside the shadow DOM.
 * We inject these directly on :host so they are always resolved,
 * regardless of any @layer ordering or specificity issues.
 */
const CSS_VARS = `
  :host {
    --agent-primary: #6366f1;
    --agent-primary-hover: #4f46e5;
    --agent-surface: #f9fafb;
    --agent-surface-light: #f3f4f6;
    --agent-bg: #ffffff;
    --agent-text: #111827;
    --agent-text-muted: #6b7280;
    --agent-success: #10b981;
    --agent-error: #ef4444;
    --agent-warning: #f59e0b;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --agent-primary: #6366f1;
      --agent-primary-hover: #4f46e5;
      --agent-surface: #1e1b4b;
      --agent-surface-light: #312e81;
      --agent-bg: #0f0d2e;
      --agent-text: #e0e7ff;
      --agent-text-muted: #a5b4fc;
      --agent-success: #34d399;
      --agent-error: #f87171;
      --agent-warning: #fbbf24;
    }
  }
`;

/**
 * Attach a shadow root to the host element and inject Tailwind CSS.
 * Returns the shadow root's mount container for React.
 */
export function attachShadowRoot(host: HTMLDivElement): HTMLDivElement {
  // Attach shadow DOM (if not already attached)
  let shadow = host.shadowRoot;
  if (!shadow) {
    shadow = host.attachShadow({ mode: "open" });
  }

  // 1. Inject CSS variables FIRST so they are available to all rules
  const varsStyle = document.createElement("style");
  varsStyle.textContent = CSS_VARS;
  shadow.appendChild(varsStyle);

  // 2. Inject compiled Tailwind styles
  const style = document.createElement("style");
  style.textContent = globalStyles;
  shadow.appendChild(style);

  // Create a mount container for React inside shadow DOM
  const mountPoint = document.createElement("div");
  mountPoint.id = "privacy-agent-mount";
  mountPoint.className = "agent-root";

  // Set basic font — do NOT use "all: initial" as it kills CSS variable inheritance
  mountPoint.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
  `;

  shadow.appendChild(mountPoint);
  return mountPoint;
}
