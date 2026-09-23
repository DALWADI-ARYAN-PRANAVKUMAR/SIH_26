/**
 * Background Service Worker — MV3 background script.
 *
 * Phase 1: Minimal — handles extension lifecycle events
 * and relays messages between popup and content scripts.
 */

import type { ExtensionMessage } from "@/types";

// Log installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("[Privacy Agent] Extension installed:", details.reason);

  // Set default enabled state
  chrome.storage.local.set({ assistantEnabled: true });
  
  // Open side panel on extension icon click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

  // Create context menu for easy access
  chrome.contextMenus.create({
    id: "open-privacy-agent",
    title: "Ask Privacy Agent",
    contexts: ["all"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-privacy-agent" && tab?.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
    // If they highlighted text, we could theoretically send it to the side panel here!
    if (info.selectionText) {
      chrome.storage.local.set({ pendingQuery: info.selectionText });
    }
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage | any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    switch (message.type) {
      case "GET_STATUS": {
        chrome.storage.local.get("assistantEnabled", (result) => {
          sendResponse({ enabled: result.assistantEnabled ?? true });
        });
        return true; // async response
      }

      case "SET_STATUS": {
        const enabled = (message.payload as { enabled: boolean })?.enabled ?? true;
        chrome.storage.local.set({ assistantEnabled: enabled }, () => {
          // Broadcast to all tabs
          chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                  type: "STATUS_CHANGED" as const,
                  payload: { enabled },
                }).catch(() => {
                  // Tab may not have content script loaded
                });
              }
            }
          });
          sendResponse({ success: true });
        });
        return true; // async response
      }

      case "OPEN_SIDE_PANEL": {
        // Attempt to open the side panel
        // Note: This often fails in Chrome if not triggered by a user gesture.
        // We will catch the error on the client side if it fails.
        if (sender.tab?.id && sender.tab?.windowId) {
          chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => {
            sendResponse({ success: true });
          }).catch((err) => {
            console.warn("Could not open side panel programmatically:", err);
            sendResponse({ error: err.message });
          });
          return true;
        }
        sendResponse({ error: "No tab info" });
        return false;
      }

      default:
        sendResponse({ error: "Unknown message type" });
        return false;
    }
  },
);

// Handle messages from the companion web dashboard (externally_connectable)
chrome.runtime.onMessageExternal.addListener(
  (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    console.log("[Privacy Agent] Received external message from:", sender.url, message);
    
    // Security check: ensure message is from our allowed origins
    if (!sender.url?.startsWith("http://localhost:") && !sender.url?.startsWith("http://127.0.0.1:")) {
      return false;
    }

    if (message.type === "SET_AVATAR_PREFS") {
      const { style, image, size } = message.payload || {};
      const updates: any = {};
      
      if (style) updates.avatarStyle = style;
      if (image !== undefined) updates.avatarImage = image;
      if (size !== undefined) updates.avatarSize = size;

      if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates, () => {
          sendResponse({ success: true, updates });
        });
        return true; // async response
      }
    }

    if (message.type === "SET_THEME_PREFS") {
      const { isDark, color } = message.payload || {};
      const updates: any = {};
      
      if (isDark !== undefined) updates.themeDark = isDark;
      if (color !== undefined) updates.themeColor = color;

      if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates, () => {
          sendResponse({ success: true, updates });
        });
        return true; // async response
      }
    }
    
    sendResponse({ error: "Unknown external message" });
    return false;
  }
);

console.log("[Privacy Agent] Background service worker started");
