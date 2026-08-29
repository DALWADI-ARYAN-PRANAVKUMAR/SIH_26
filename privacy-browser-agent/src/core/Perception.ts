/**
 * Perception Module — Extracts page context from the DOM.
 *
 * Phase 1: Returns minimal mock data.
 * Phase 2+: Will perform real DOM extraction (text, structure, metadata).
 */

import type { PerceptionResult } from "@/types";

/**
 * Perceive the current page and extract relevant context.
 * Callers should treat this as an opaque async operation — the implementation
 * will become significantly more complex in later phases.
 */
export async function perceivePage(): Promise<PerceptionResult> {
  // TODO Phase 2: Real DOM extraction — readability parse, metadata, structured content
  return {
    pageText: "",
    url: typeof window !== "undefined" ? window.location.href : "",
    title: typeof document !== "undefined" ? document.title : "",
  };
}
