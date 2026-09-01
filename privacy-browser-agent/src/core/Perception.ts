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
export async function perceivePage(userMessage?: string): Promise<PerceptionResult> {
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
      const pageContext = response.context;
      
      // 3. Optional: Run Vision Pipeline
      // Only run if user prompted for visual info, or randomly on first load for demonstration
      // We will export a way to force it, but for now we'll do a simple heuristic
      let visualContext = undefined;
      const requiresVision = userMessage && (
        userMessage.toLowerCase().includes("see") ||
        userMessage.toLowerCase().includes("visual") ||
        userMessage.toLowerCase().includes("screen") ||
        userMessage.toLowerCase().includes("image") ||
        userMessage.toLowerCase().includes("button") ||
        userMessage.toLowerCase().includes("layout") ||
        userMessage.toLowerCase().includes("where")
      );
      
      if (requiresVision) {
        try {
          const { runVisionPipeline } = await import("../vision/VisionEngine");
          visualContext = await runVisionPipeline();
        } catch (e) {
          console.warn("[Privacy Agent] Vision pipeline failed:", e);
        }
      }

      if (visualContext) {
        pageContext.visual = visualContext;
        
        // Draw debug boxes for visual elements and redactions
        const boxes = [
          ...visualContext.elements.map((e: any) => ({ bbox: e.bbox, label: e.type, color: "blue" })),
          ...visualContext.redactions.map((r: any) => ({ bbox: r.bbox, label: r.category, color: "red" }))
        ];
        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: "DRAW_DEBUG_BOXES",
            payload: { boxes }
          });
        } catch (e) { /* ignore */ }
      }

      return {
        url: pageContext.page.url,
        title: pageContext.page.title,
        pageText: pageContext.text.join(" "),
        pageContext: pageContext
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
