import React from "react";
import { useAssistantStore } from "@/state/assistantStore";
import { MessageList } from "@/assistant/MessageList";
import { InputBox } from "@/assistant/InputBox";
import { StatusIndicator } from "@/assistant/StatusIndicator";
import { ActivityPanel } from "@/assistant/ActivityPanel";

const TABS = [
  { key: "chat" as const, label: "Chat" },
  { key: "activity" as const, label: "Activity" },
  { key: "privacy" as const, label: "Privacy" },
] as const;

export const SidePanelApp: React.FC = () => {
  const activeTab = useAssistantStore((s) => s.activeTab);
  const setActiveTab = useAssistantStore((s) => s.setActiveTab);
  const state = useAssistantStore((s) => s.state);

  const isFullScreenTab = 
    new URLSearchParams(window.location.search).get("mode") === "tab" || 
    window.innerWidth > 600;

  return (
    <div className="absolute inset-0 flex flex-col bg-agent-bg overflow-hidden text-agent-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-agent-surface backdrop-blur-md border-b border-agent-surface-light">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-agent-text">
            🛡️ Privacy Agent
          </span>
          {state !== "IDLE" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-agent-primary/20 text-agent-primary font-medium">
              {state}
            </span>
          )}
        </div>
        
        {/* Easy Access Expand / Close Button */}
        {isFullScreenTab ? (
          <button
            onClick={() => {
              window.close(); // Close the tab
            }}
            className="text-agent-text-muted hover:text-agent-error w-7 h-7 flex items-center justify-center rounded-md hover:bg-agent-surface-light transition-colors"
            title="Close Tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => {
              chrome.tabs.create({ url: chrome.runtime.getURL("src/extension/sidepanel/sidepanel.html?mode=tab") });
            }}
            className="text-agent-text-muted hover:text-agent-text w-7 h-7 flex items-center justify-center rounded-md hover:bg-agent-surface-light transition-colors"
            title="Open in full screen tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-agent-surface-light">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "text-agent-primary border-b-2 border-agent-primary bg-agent-primary/5"
                : "text-agent-text-muted hover:text-agent-text hover:bg-agent-surface/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "chat" && (
        <>
          <MessageList />
          <InputBox />
        </>
      )}
      {activeTab === "activity" && <ActivityPanel />}
      {activeTab === "privacy" && <StatusIndicator />}
    </div>
  );
};
