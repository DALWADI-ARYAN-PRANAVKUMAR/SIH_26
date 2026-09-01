/**
 * Reasoning Module — Generates AI responses.
 *
 * Connects to the local FastAPI backend in Phase 2 to use a real LLM.
 */

import type { PerceptionResult, PrivacyResult, ReasoningResult } from "@/types";

/**
 * Generate a response to the user's message given page context and sanitized input.
 *
 * @param userMessage - The user's input text.
 * @param perception - Page context.
 * @param privacy - Sanitized data.
 * @returns A reasoning result with the reply and confidence score.
 */
export async function generateResponse(
  userMessage: string,
  perception: PerceptionResult,
  privacy: PrivacyResult,
): Promise<ReasoningResult> {
  const messageToSend = privacy.sanitizedText || userMessage;

  try {
    let sanitizedContext = null;
    if (perception.pageContext) {
      const { PrivacyEngine } = await import("@/privacy/PrivacyEngine");
      const { useAssistantStore } = await import("@/state/assistantStore");
      
      const privStart = performance.now();
      sanitizedContext = await PrivacyEngine.sanitize(perception.pageContext);
      const privLatency = Math.round(performance.now() - privStart);
      
      // Update system metrics
      useAssistantStore.getState().updateSystemMetrics({ privacyLatencyMs: privLatency });
      
      // Update privacy metadata for UI
      useAssistantStore.getState().setPrivacyMetadata(sanitizedContext.privacy);
    }

    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageToSend,
        pageContext: sanitizedContext
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply,
      confidence: data.confidence,
    };
  } catch (err) {
    console.error("[Privacy Agent] Backend communication failed:", err);
    return {
      reply: "⚠️ The backend server is unreachable. Please ensure it is running on port 8000.",
      confidence: 0,
    };
  }
}
