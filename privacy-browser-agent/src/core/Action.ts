/**
 * Action Module — Executes browser actions (click, type, navigate).
 *
 * Phase 1: Always returns noop.
 * Phase 4+: Will interpret action plans from reasoning and execute them on the DOM.
 */

import type { ActionResult, ReasoningResult } from "@/types";

/**
 * Execute a browser action based on the reasoning output.
 *
 * @param _reasoning - The reasoning result that may contain action instructions.
 * @returns The result of the action execution.
 */
export async function executeAction(
  _reasoning: ReasoningResult,
): Promise<ActionResult> {
  // TODO Phase 4: Parse action plan from reasoning, execute DOM manipulations
  return {
    status: "noop",
    description: "No action executed — action engine not yet implemented.",
  };
}
