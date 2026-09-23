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

  const [themeColor, setThemeColor] = React.useState('#18181b');

  React.useEffect(() => {
    // Initial load
    chrome.storage.local.get(['themeDark', 'themeColor'], (res) => {
      if (res.themeDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      
      if (res.themeColor) {
        setThemeColor(res.themeColor);
        document.documentElement.style.setProperty('--theme-color', res.themeColor);
      }
    });

    // Listen for changes
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.themeDark) {
        if (changes.themeDark.newValue) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
      if (changes.themeColor) {
        setThemeColor(changes.themeColor.newValue);
        document.documentElement.style.setProperty('--theme-color', changes.themeColor.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: themeColor }}>
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">
            Privacy Agent
          </span>
          {state !== "IDLE" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-white font-medium uppercase tracking-wider">
              {state}
            </span>
          )}
        </div>
        
        <button
          onClick={() => {
            window.open('http://localhost:5173', '_blank');
          }}
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Settings Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Tab content area (Middle) */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col">
            <MessageList />
            <InputBox />
          </div>
        )}
        {activeTab === "vault" && <VaultPanel />}
        {activeTab === "privacy" && <StatusIndicator />}
        {activeTab === "activity" && <ActivityPanel />}
        {activeTab === "system" && <SystemMetrics />}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-2 pt-1 px-2 justify-around">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.key
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
            style={activeTab === tab.key ? { backgroundColor: themeColor } : {}}
          >
            {/* Simple static icon mapping based on tab key since lucide isn't imported here */}
            {tab.key === 'chat' && <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
            {tab.key === 'vault' && <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            {tab.key === 'privacy' && <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            {tab.key === 'activity' && <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            {tab.key === 'system' && <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
            
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
