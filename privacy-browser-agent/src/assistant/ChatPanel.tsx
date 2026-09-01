/**
 * ChatPanel — The expanded chat window.
 *
 * Contains: header with tabs, tab content (chat/activity/privacy), and input box.
 * Positioned adjacent to the avatar.
 */

import React from "react";
import { useAssistantStore } from "@/state/assistantStore";
import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import { StatusIndicator } from "./StatusIndicator";
import { ActivityPanel } from "./ActivityPanel";

const TABS = [
  { key: "chat" as const, label: "Chat" },
  { key: "activity" as const, label: "Activity" },
  { key: "privacy" as const, label: "Privacy" },
] as const;

export const ChatPanel: React.FC = () => {
  const isPanelOpen = useAssistantStore((s) => s.isPanelOpen);
  const setPanel = useAssistantStore((s) => s.setPanel);
  const activeTab = useAssistantStore((s) => s.activeTab);
  const setActiveTab = useAssistantStore((s) => s.setActiveTab);
  const state = useAssistantStore((s) => s.state);

  if (!isPanelOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "380px",
        height: "100vh",
        zIndex: 2147483647,
        pointerEvents: "auto",
        // Simple slide-in animation
        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
      className="flex flex-col bg-agent-bg shadow-neu overflow-hidden"
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-agent-text">
            ✦ Privacy Agent
          </span>
          {state !== "IDLE" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-agent-primary/20 text-agent-primary font-medium">
              {state}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Minimize */}
          <button
            onClick={() => setPanel(false)}
            className="text-agent-text-muted hover:text-agent-text w-7 h-7 flex items-center justify-center rounded-md hover:bg-agent-surface-light transition-colors text-base"
            title="Minimize"
          >
            −
          </button>
          {/* Close */}
          <button
            onClick={() => setPanel(false)}
            className="text-agent-text-muted hover:text-agent-error w-7 h-7 flex items-center justify-center rounded-md hover:bg-agent-surface-light transition-colors text-sm"
            title="Close"
          >
            ✕
          </button>
        </div>
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
