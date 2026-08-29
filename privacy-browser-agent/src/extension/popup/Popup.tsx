/**
 * Popup — Extension toolbar popup.
 *
 * Shows: extension name, active/inactive status pill, enable/disable toggle.
 * Wires the toggle to show/hide the content-script avatar via chrome.storage.
 */

import React, { useEffect, useState } from "react";

export const Popup: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [version] = useState("0.1.0");

  // Load initial state
  useEffect(() => {
    chrome.storage.local.get("assistantEnabled", (result) => {
      setEnabled(result.assistantEnabled ?? true);
    });
  }, []);

  const handleToggle = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    // Update storage (content script watches this)
    await chrome.storage.local.set({ assistantEnabled: newEnabled });

    // Also send message via background to all tabs for immediate effect
    chrome.runtime.sendMessage({
      type: "SET_STATUS",
      payload: { enabled: newEnabled },
    });
  };

  if (enabled === null) {
    return (
      <div className="p-6 bg-agent-bg text-agent-text text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-5 bg-agent-bg min-h-[200px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-agent-primary rounded-xl flex items-center justify-center text-white text-lg font-bold">
          ✦
        </div>
        <div>
          <h1 className="text-agent-text font-semibold text-sm">
            Privacy Browser Agent
          </h1>
          <p className="text-agent-text-muted text-[11px]">
            v{version} — Phase 1
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-agent-surface rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-agent-text text-xs font-medium">Status</span>
          <span
            className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
              enabled
                ? "bg-agent-success/20 text-agent-success"
                : "bg-agent-error/20 text-agent-error"
            }`}
          >
            {enabled ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          className={`w-full py-2.5 rounded-lg text-xs font-medium transition-colors ${
            enabled
              ? "bg-agent-error/20 text-agent-error hover:bg-agent-error/30"
              : "bg-agent-primary text-white hover:bg-agent-primary-hover"
          }`}
        >
          {enabled ? "Disable Assistant" : "Enable Assistant"}
        </button>
      </div>

      {/* Info */}
      <div className="text-agent-text-muted text-[10px] text-center leading-relaxed">
        The assistant appears as a floating button on every webpage.
        <br />
        All responses are locally mocked — no data leaves your browser.
      </div>
    </div>
  );
};
