/**
 * AgentEngine — Orchestrates the full pipeline for a single turn.
 *
 * Call chain: Perception → Privacy → Reasoning → Action
 *
 * The engine is stateless; it takes a user message and returns a complete
 * AgentResponse. AssistantController manages state transitions around it.
 */

import type { AgentResponse } from "@/types";
import { perceivePage } from "./Perception";
import { sanitizeText } from "./Privacy";
import { generateResponse } from "./Reasoning";
import { executeAction } from "./Action";

export interface TurnCallbacks {
  onPerceptionStart?: () => void;
  onPerceptionDone?: () => void;
  onPrivacyStart?: () => void;
  onPrivacyDone?: () => void;
  onReasoningStart?: () => void;
  onReasoningDone?: () => void;
  onActionStart?: () => void;
  onActionDone?: () => void;
}

/**
 * Run a full agent turn: perceive → sanitize → reason → act.
 *
 * @param userMessage - The user's input text.
 * @param callbacks - Optional lifecycle callbacks for activity logging.
 * @returns The complete pipeline response.
 */
export async function runTurn(
  userMessage: string,
  callbacks?: TurnCallbacks,
): Promise<AgentResponse> {
  // Step 1: Perception
  callbacks?.onPerceptionStart?.();
  const perception = await perceivePage();
  callbacks?.onPerceptionDone?.();

  // Step 2: Privacy
  callbacks?.onPrivacyStart?.();
  const privacy = await sanitizeText(
    perception.pageText || userMessage,
  );
  callbacks?.onPrivacyDone?.();

  // Step 3: Reasoning
  callbacks?.onReasoningStart?.();
  const reasoning = await generateResponse(
    userMessage,
    perception,
    privacy,
  );
  callbacks?.onReasoningDone?.();

  // Step 4: Action
  callbacks?.onActionStart?.();
  const action = await executeAction(reasoning);
  callbacks?.onActionDone?.();

  return { perception, privacy, reasoning, action };
}
