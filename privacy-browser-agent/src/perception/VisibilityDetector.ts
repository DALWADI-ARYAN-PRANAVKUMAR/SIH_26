/**
 * VisibilityDetector.ts
 * Robust checks to determine if an element is meaningfully visible to the user.
 */

export function isElementVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
    return false;
  }

  // Fast check: disabled elements are visible but inactive
  // But hidden inputs are completely invisible
  if (el instanceof HTMLInputElement && el.type === "hidden") {
    return false;
  }

  // Check aria-hidden
  if (el.getAttribute("aria-hidden") === "true") {
    return false;
  }

  const style = window.getComputedStyle(el);

  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }

  // Check bounding rect for zero size
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    // Exceptions: inline elements might have 0 dimensions but visible children
    // However, for typical interactive elements, 0 size means invisible.
    // Allow exceptions for elements that overflow their 0x0 container.
    if (style.overflow === "hidden") {
      return false;
    }
  }

  // Note: We avoid strict viewport checks (checking if rect is within window bounds)
  // because the user might just need to scroll down. We want the full page context.

  return true;
}
