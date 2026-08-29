/**
 * Reasoning Module — Generates assistant responses via LLM.
 *
 * Phase 1: Returns hardcoded/templated strings based on keyword matching.
 * Phase 3+: Will call a real LLM backend.
 */

import type { ReasoningResult, PerceptionResult, PrivacyResult } from "@/types";

/** Keyword→response mapping for mock demo. */
const CANNED_RESPONSES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["summarize", "summary", "tldr"],
    reply:
      "This page contains information about the current topic. A full summary would analyze headings, paragraphs, and key data points. (Summary engine coming in Phase 3.)",
  },
  {
    keywords: ["help", "what can you do", "commands"],
    reply:
      'I\'m the Privacy Browser Agent! In this Phase 1 demo I can respond to a few keywords:\n• "summarize" — mock page summary\n• "help" — this message\n• "privacy" — privacy status\n• "navigate" / "click" — mock action demo\nFull capabilities are coming in later phases.',
  },
  {
    keywords: ["privacy", "private", "redact", "safe"],
    reply:
      "🔒 Privacy Engine is planned for Phase 5. Right now, no data leaves your browser — all responses are locally mocked. When implemented, the privacy layer will redact PII before any data is processed.",
  },
  {
    keywords: ["navigate", "click", "go to", "open"],
    reply:
      "⚙️ Action execution is planned for Phase 4. I acknowledged your request but cannot perform browser actions yet. The action module returned: { status: \"noop\" }.",
  },
  {
    keywords: ["hello", "hi", "hey", "greet"],
    reply:
      "Hello! 👋 I'm your Privacy Browser Agent. I live inside every webpage to help you browse safely and efficiently. Ask me anything — though I'm still in Phase 1, so my responses are limited!",
  },
];

const FALLBACK_REPLY =
  "I received your message. In Phase 1, I can only respond to a few preset keywords. Try typing \"help\" to see what I can demo. Full AI reasoning is coming in Phase 3.";

/**
 * Generate a response to the user's message given page context and sanitized input.
 *
 * @param userMessage - The user's input text.
 * @param _perception - Page context (unused in Phase 1).
 * @param _privacy - Sanitized data (unused in Phase 1).
 * @returns A reasoning result with the reply and confidence score.
 */
export async function generateResponse(
  userMessage: string,
  _perception: PerceptionResult,
  _privacy: PrivacyResult,
): Promise<ReasoningResult> {
  // TODO Phase 3: Replace with real LLM API call
  // Simulate thinking latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const lowerMessage = userMessage.toLowerCase();

  for (const entry of CANNED_RESPONSES) {
    if (entry.keywords.some((kw) => lowerMessage.includes(kw))) {
      return { reply: entry.reply, confidence: 0.95 };
    }
  }

  return { reply: FALLBACK_REPLY, confidence: 0.5 };
}
