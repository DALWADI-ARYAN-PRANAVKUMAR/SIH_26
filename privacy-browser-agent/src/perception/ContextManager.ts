/**
 * ContextManager.ts
 * Orchestrates DOM extraction and manages caching/debouncing.
 */

import { extractPageContext } from "./DOMExtractor";
import type { PageContext } from "@/types";

let cachedContext: PageContext | null = null;
let isDirty = true;
let mutationObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function initContextManager(): void {
  if (mutationObserver) return; // Already initialized

  mutationObserver = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      isDirty = true;
    }, 1000); // Debounce mutations by 1 second
  });

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden']
  });

  // Track SPA navigation
  window.addEventListener('popstate', () => { isDirty = true; });
}

export function getCurrentPageContext(): PageContext {
  if (isDirty || !cachedContext) {
    const startTime = performance.now();
    cachedContext = extractPageContext();
    const duration = performance.now() - startTime;
    
    // Developer Debug Log
    console.debug(`[Privacy Agent] Page Context extracted in ${duration.toFixed(2)}ms`, {
      headings: cachedContext.headings.length,
      buttons: cachedContext.elements.buttons.length,
      inputs: cachedContext.elements.inputs.length,
      links: cachedContext.elements.links.length,
      textChunks: cachedContext.text.length
    });
    
    isDirty = false;
  }
  return cachedContext;
}
