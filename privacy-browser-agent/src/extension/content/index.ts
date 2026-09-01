/**
 * Content Script Entry Point — mounts the Privacy Browser Agent into the page.
 *
 * Sequence:
 * 1. Check if assistant is enabled.
 * 2. Create host element in <body>.
 * 3. Attach shadow DOM with isolated Tailwind styles.
 * 4. Mount React root inside shadow DOM.
 * 5. Install SPA re-injection guard.
 * 6. Listen for enable/disable messages from popup.
 */

import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { createHostElement, installReinjectionGuard } from "./injector";
import { attachShadowRoot } from "./shadowRoot";
import { Assistant } from "@/assistant/Assistant";
import { initializeAssistant } from "@/core/AssistantController";
import { isAssistantEnabled, onStorageChange } from "@/extension/storage";
import { onMessage } from "@/extension/messaging";
import { initContextManager, getCurrentPageContext } from "@/perception/ContextManager";
import { executeDOMAction } from "./executor";
import type { ExtensionMessage } from "@/types";

console.log("[Privacy Agent] Content script loaded");
initContextManager();

let reactRoot: Root | null = null;
let hostElement: HTMLDivElement | null = null;

/** Mount the React app into the shadow DOM. */
function mountApp(mountPoint: HTMLDivElement): void {
  if (reactRoot) return; // Already mounted

  reactRoot = createRoot(mountPoint);
  reactRoot.render(React.createElement(Assistant));
  initializeAssistant();
  console.log("[Privacy Agent] Assistant mounted");
}

/** Unmount the React app and remove the host element. */
function unmountApp(): void {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
  }
  console.log("[Privacy Agent] Assistant unmounted");
}

/** Full mount sequence: create host → shadow DOM → React. */
function fullMount(): void {
  if (reactRoot) return; // Already mounted

  hostElement = createHostElement();
  const mountPoint = attachShadowRoot(hostElement);
  mountApp(mountPoint);
}

/** Initialize the content script. */
async function init(): Promise<void> {
  // Check initial enabled state
  const enabled = await isAssistantEnabled();
  if (enabled) {
    fullMount();
  }

  // Install SPA re-injection guard
  installReinjectionGuard((newHost) => {
    // Host was removed and re-injected — re-mount React
    console.log("[Privacy Agent] Re-injecting after SPA navigation");
    reactRoot = null; // Old root is gone
    hostElement = newHost;
    const mountPoint = attachShadowRoot(newHost);
    mountApp(mountPoint);
  });

  // Listen for enable/disable messages from popup via background
  onMessage(
    (
      message: ExtensionMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void,
    ) => {
      if (message.type === "STATUS_CHANGED") {
        const enabled = (message.payload as { enabled: boolean })?.enabled;
        if (enabled) {
          fullMount();
        } else {
          unmountApp();
        }
        sendResponse({ success: true });
      }
      if (message.type === "TOGGLE_ASSISTANT") {
        if (reactRoot) {
          unmountApp();
        } else {
          fullMount();
        }
        sendResponse({ success: true });
      }
      if (message.type === "GET_PAGE_CONTEXT") {
        const context = getCurrentPageContext();
        sendResponse({ success: true, context });
      }
      if (message.type === "EXECUTE_ACTION" && message.payload) {
        // Execute action
        executeDOMAction(message.payload as any).then((result) => {
          sendResponse(result);
        });
        return true;
      }
      if (message.type === "DRAW_DEBUG_BOXES" && message.payload) {
        import("./debugger").then(({ drawDebugBoxes }) => {
          drawDebugBoxes((message.payload as any).boxes || []);
          sendResponse({ success: true });
        });
        return true;
      }
    },
  );

  // Also watch storage directly for enable/disable changes
  onStorageChange((changes) => {
    if (changes.assistantEnabled !== undefined) {
      if (changes.assistantEnabled) {
        fullMount();
      } else {
        unmountApp();
      }
    }
  });
}

init();
