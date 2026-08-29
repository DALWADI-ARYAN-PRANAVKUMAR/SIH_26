/**
 * Chrome Messaging Helpers — wraps chrome.runtime/tabs messaging
 * so core/ and assistant/ never call chrome.* directly.
 */

import type { ExtensionMessage } from "@/types";

/** Send a message to the background service worker. */
export async function sendToBackground(
  message: ExtensionMessage,
): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

/** Send a message to the content script in a specific tab. */
export async function sendToTab(
  tabId: number,
  message: ExtensionMessage,
): Promise<unknown> {
  return chrome.tabs.sendMessage(tabId, message);
}

/** Listen for messages from other parts of the extension. */
export function onMessage(
  handler: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => void | boolean,
): () => void {
  chrome.runtime.onMessage.addListener(handler);
  return () => chrome.runtime.onMessage.removeListener(handler);
}
