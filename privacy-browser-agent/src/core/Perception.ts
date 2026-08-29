/**
 * Perception Module — Extracts page context from the DOM.
 *
 * Phase 1: Returns minimal mock data.
 * Phase 2+: Will perform real DOM extraction (text, structure, metadata).
 */

import type { PerceptionResult, PageContext, ExtensionMessage } from "@/types";

/**
 * Perceive the current page and extract relevant context.
 * This runs in the Side Panel or Background, so it delegates extraction
 * to the Content Script injected into the active webpage.
 */
export async function perceivePage(): Promise<PerceptionResult> {
  if (typeof chrome === "undefined" || !chrome.tabs) {
    throw new Error("Cannot perceive page: Chrome tabs API unavailable");
  }

  // 1. Get the active tab in the current window
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  
  if (!activeTab || !activeTab.id) {
    throw new Error("No active tab found to perceive.");
  }

  try {
    // 2. Request PageContext from the content script
    const message: ExtensionMessage = { type: "GET_PAGE_CONTEXT" };
    const response = await chrome.tabs.sendMessage(activeTab.id, message) as { success: boolean; context: PageContext };
    
    if (response?.success && response.context) {
      return {
        url: response.context.page.url,
        title: response.context.page.title,
        pageText: response.context.text.join(" "),
        pageContext: response.context
      };
    }
    
    throw new Error("Invalid response from content script");
  } catch (err) {
    // Content script might not be injected (e.g. on chrome:// URLs)
    console.warn("[Privacy Agent] Perception failed:", err);
    return {
      url: activeTab.url || "",
      title: activeTab.title || "",
      pageText: "Content cannot be extracted on this page.",
    };
  }
}
