/**
 * Zustand store — single source of truth for assistant state.
 *
 * All UI components read from this store.
 * Only AssistantController writes state transitions.
 */

import { create } from "zustand";
import type { AssistantStoreState, Message, ActivityEvent } from "@/types";

const STORE_KEY = "assistant_sync_state";

export const useAssistantStore = create<AssistantStoreState>((set) => ({
  // State machine
  state: "IDLE",
  setState: (state) => set({ state }),

  // Phase 3 Task Management
  taskState: "IDLE",
  setTaskState: (state) => set({ taskState: state }),
  activeTask: null,
  setActiveTask: (task) => set({ activeTask: task }),
  taskLogs: [],
  addTaskLog: (log) => set((s) => ({ taskLogs: [...s.taskLogs, log] })),
  clearTaskLogs: () => set({ taskLogs: [] }),
  pendingPlan: null,
  setPendingPlan: (plan) => set({ pendingPlan: plan }),
  cancelTask: () => set({ taskState: "CANCELLED", activeTask: null, pendingPlan: null }),

  lastPrivacyMetadata: null,
  setPrivacyMetadata: (meta: any) => set({ lastPrivacyMetadata: meta }),

  // Chat messages
  messages: [],
  addMessage: (message: Message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  // Activity log
  activities: [],
  addActivity: (activity: ActivityEvent) =>
    set((s) => ({ activities: [activity, ...s.activities].slice(0, 50) })),
  updateActivity: (id: string, updates: Partial<ActivityEvent>) =>
    set((s) => ({
      activities: s.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    })),
  clearActivities: () => set({ activities: [] }),

  // Panel visibility
  isPanelOpen: false,
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setPanel: (open: boolean) => set({ isPanelOpen: open }),

  // Active tab
  activeTab: "chat",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// Setup Cross-Context Synchronization (Content Script <-> Side Panel)
let isHydrating = false;

// 1. Listen for local store changes and push to chrome.storage
useAssistantStore.subscribe((state) => {
  if (isHydrating || typeof chrome === "undefined" || !chrome.storage?.local) return;
  
  // We sync the entire state EXCEPT isPanelOpen (which is local to each context)
  const syncState = {
    state: state.state,
    taskState: state.taskState,
    activeTask: state.activeTask,
    taskLogs: state.taskLogs,
    pendingPlan: state.pendingPlan,
    messages: state.messages,
    activities: state.activities,
    activeTab: state.activeTab,
  };
  chrome.storage.local.set({ [STORE_KEY]: syncState }).catch(() => {});
});

// 2. Listen for external changes (from other tabs/side panel)
if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORE_KEY]) {
      const newState = changes[STORE_KEY].newValue;
      if (newState) {
        isHydrating = true;
        useAssistantStore.setState({
          state: newState.state,
          taskState: newState.taskState,
          activeTask: newState.activeTask,
          taskLogs: newState.taskLogs,
          pendingPlan: newState.pendingPlan,
          messages: newState.messages,
          activities: newState.activities,
          activeTab: newState.activeTab,
        });
        isHydrating = false;
      }
    }
  });

  // 3. Initial load
  chrome.storage.local.get(STORE_KEY, (res) => {
    if (res[STORE_KEY]) {
      isHydrating = true;
      useAssistantStore.setState(res[STORE_KEY]);
      isHydrating = false;
    }
  });
}
