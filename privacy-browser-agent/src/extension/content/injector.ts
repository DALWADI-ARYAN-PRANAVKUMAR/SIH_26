/**
 * Injector — Creates the host element and appends it to <body>.
 *
 * Also installs a MutationObserver re-injection guard so the
 * agent survives SPA-style soft navigation that may remove DOM nodes.
 */

const HOST_ID = "privacy-agent-root";

/**
 * Create (or reclaim) the host element for the shadow DOM.
 * Returns the host element — caller is responsible for mounting React into it.
 */
export function createHostElement(): HTMLDivElement {
  // Check if already exists (re-injection guard)
  const existing = document.getElementById(HOST_ID) as HTMLDivElement | null;
  if (existing) return existing;

  const host = document.createElement("div");
  host.id = HOST_ID;

  // Prevent host-page CSS from affecting our container
  host.style.cssText = `
    all: initial;
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 2147483647;
    pointer-events: none;
  `;

  document.body.appendChild(host);
  return host;
}

/**
 * Install a MutationObserver that re-injects the host node if it
 * gets removed from the DOM (e.g. by SPA frameworks that replace <body> content).
 *
 * @param onReinjected - Called when the host was removed and re-injected.
 */
export function installReinjectionGuard(
  onReinjected: (host: HTMLDivElement) => void,
): void {
  const observer = new MutationObserver(() => {
    if (!document.getElementById(HOST_ID)) {
      // Our host was removed — re-inject
      const host = createHostElement();
      onReinjected(host);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: false,
  });
}
