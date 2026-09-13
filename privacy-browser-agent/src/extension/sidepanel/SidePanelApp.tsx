import React from "react";
import { useAssistantStore } from "@/state/assistantStore";
import { MessageList } from "@/assistant/MessageList";
import { InputBox } from "@/assistant/InputBox";
import { StatusIndicator } from "@/assistant/StatusIndicator";
import { ActivityPanel } from "@/assistant/ActivityPanel";
import { SystemMetrics } from "@/assistant/SystemMetrics";
import { VaultPanel } from "@/assistant/VaultPanel";

const TABS = [
  { key: "chat" as const, label: "Chat" },
  { key: "vault" as const, label: "Vault" },
  { key: "privacy" as const, label: "Privacy" },
  { key: "activity" as const, label: "Activity" },
  { key: "system" as const, label: "System" },
] as const;

export const SidePanelApp: React.FC = () => {
  const activeTab = useAssistantStore((s) => s.activeTab);
  const setActiveTab = useAssistantStore((s) => s.setActiveTab);
  const state = useAssistantStore((s) => s.state);



  return (
    <div className="absolute inset-0 flex flex-col bg-agent-bg overflow-hidden text-agent-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
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
        
        {/* Settings Dashboard Button */}
        <button
          onClick={() => {
            if (chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            } else {
              window.open(chrome.runtime.getURL('src/extension/options/options.html'));
            }
          }}
          className="text-agent-text-muted hover:text-agent-text w-7 h-7 flex items-center justify-center rounded-md hover:bg-agent-surface-light transition-colors"
          title="Settings Dashboard"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 px-4 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "text-agent-primary shadow-neu-inset bg-agent-bg"
                : "text-agent-text-muted hover:text-agent-text shadow-neu bg-agent-bg"
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
      {activeTab === "vault" && <VaultPanel />}
      {activeTab === "privacy" && <StatusIndicator />}
      {activeTab === "activity" && <ActivityPanel />}
      {activeTab === "system" && <SystemMetrics />}
    </div>
  );
};
