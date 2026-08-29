/**
 * AssistantController — The single orchestration point between UI and core.
 *
 * Responsibilities:
 * 1. Owns all state transitions (IDLE → THINKING → EXECUTING → SUCCESS → IDLE).
 * 2. Delegates work to AgentEngine.
 * 3. Populates activity log at each pipeline stage.
 * 4. UI components call ONLY this module — never AgentEngine or sub-modules directly.
 *
 * Designed so that replacing mock implementations requires zero changes here —
 * the AgentEngine and its sub-modules own their own contracts.
 */

import type { Message, ActivityEvent, AssistantState } from "@/types";
import { runTurn, type TurnCallbacks } from "./AgentEngine";
import { useAssistantStore } from "@/state/assistantStore";

/** Generate a unique ID for messages and activity events. */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Duration (ms) to hold SUCCESS/ERROR state before returning to IDLE. */
const AUTO_RETURN_DELAY = 1500;

/**
 * Send a user message and run a full assistant turn.
 *
 * This is the primary entry point for the UI. It:
 * 1. Adds the user message to the store.
 * 2. Transitions through THINKING → EXECUTING → SUCCESS/ERROR → IDLE.
 * 3. Adds the assistant reply to the store.
 * 4. Logs each pipeline stage as an activity event.
 */
export async function sendMessage(text: string): Promise<void> {
  const store = useAssistantStore.getState();

  // Guard: don't accept input while already processing
  if (store.state !== "IDLE" && store.state !== "LISTENING") {
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) return;

  // 1. Add user message
  const userMessage: Message = {
    id: uid(),
    role: "user",
    content: trimmed,
    timestamp: Date.now(),
  };
  store.addMessage(userMessage);

  // 2. Create activity tracking IDs
  const actPerception: ActivityEvent = {
    id: uid(),
    label: "Perceiving page context",
    status: "pending",
    timestamp: Date.now(),
  };
  const actPrivacy: ActivityEvent = {
    id: uid(),
    label: "Running privacy filter",
    status: "pending",
    timestamp: Date.now(),
  };
  const actReasoning: ActivityEvent = {
    id: uid(),
    label: "Generating response",
    status: "pending",
    timestamp: Date.now(),
  };
  const actAction: ActivityEvent = {
    id: uid(),
    label: "Checking for actions",
    status: "pending",
    timestamp: Date.now(),
  };

  // 3. Transition to THINKING
  transition("THINKING");

  // 4. Log the turn start
  const turnStart: ActivityEvent = {
    id: uid(),
    label: `Processing: "${trimmed.slice(0, 40)}${trimmed.length > 40 ? "…" : ""}"`,
    status: "done",
    timestamp: Date.now(),
  };
  store.addActivity(turnStart);

  try {
    // 5. Build lifecycle callbacks for activity logging
    const callbacks: TurnCallbacks = {
      onPerceptionStart() {
        store.addActivity(actPerception);
      },
      onPerceptionDone() {
        store.updateActivity(actPerception.id, { status: "done" });
      },
      onPrivacyStart() {
        store.addActivity(actPrivacy);
        transition("EXECUTING");
      },
      onPrivacyDone() {
        store.updateActivity(actPrivacy.id, { status: "done" });
      },
      onReasoningStart() {
        store.addActivity(actReasoning);
      },
      onReasoningDone() {
        store.updateActivity(actReasoning.id, { status: "done" });
      },
      onActionStart() {
        store.addActivity(actAction);
      },
      onActionDone() {
        store.updateActivity(actAction.id, { status: "done" });
      },
    };

    // 6. Run the full pipeline
    const response = await runTurn(trimmed, callbacks);

    // 7. Add assistant reply
    const assistantMessage: Message = {
      id: uid(),
      role: "assistant",
      content: response.reasoning.reply,
      timestamp: Date.now(),
    };
    store.addMessage(assistantMessage);

    // 8. Log completion
    const completionEvent: ActivityEvent = {
      id: uid(),
      label: "Response ready",
      status: "done",
      timestamp: Date.now(),
    };
    store.addActivity(completionEvent);

    // 9. Transition to SUCCESS, then auto-return to IDLE
    transition("SUCCESS");
    setTimeout(() => transition("IDLE"), AUTO_RETURN_DELAY);
  } catch (error) {
    // Error path: log and transition to ERROR
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    const errorEvent: ActivityEvent = {
      id: uid(),
      label: `Error: ${errorMessage}`,
      status: "error",
      timestamp: Date.now(),
    };
    store.addActivity(errorEvent);

    const errorReply: Message = {
      id: uid(),
      role: "system",
      content: `⚠️ An error occurred: ${errorMessage}`,
      timestamp: Date.now(),
    };
    store.addMessage(errorReply);

    transition("ERROR");
    setTimeout(() => transition("IDLE"), AUTO_RETURN_DELAY);
  }
}

/**
 * Transition the assistant to a new state.
 * Centralised here so we can add validation / logging later.
 */
function transition(newState: AssistantState): void {
  useAssistantStore.getState().setState(newState);
}

/**
 * Initialize the assistant. Called once when the content script mounts.
 * Logs the initial "ready" activity event.
 */
export function initializeAssistant(): void {
  const store = useAssistantStore.getState();
  store.setState("IDLE");

  const bootEvent: ActivityEvent = {
    id: uid(),
    label: "Privacy Browser Agent loaded",
    status: "done",
    timestamp: Date.now(),
  };
  store.addActivity(bootEvent);

  const pageEvent: ActivityEvent = {
    id: uid(),
    label: `Page detected: ${document.title || window.location.href}`,
    status: "done",
    timestamp: Date.now(),
  };
  store.addActivity(pageEvent);
}
