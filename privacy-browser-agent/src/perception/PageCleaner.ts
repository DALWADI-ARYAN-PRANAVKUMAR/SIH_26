/**
 * PageCleaner.ts
 * Determines which elements contain meaningful semantic context vs noise.
 */

const IGNORE_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "META",
  "LINK",
  "HEAD"
]);

export function isIrrelevantNoise(el: Element): boolean {
  if (IGNORE_TAGS.has(el.tagName)) {
    return true;
  }
  return false;
}
