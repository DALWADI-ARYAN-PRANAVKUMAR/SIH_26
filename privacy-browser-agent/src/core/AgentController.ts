/**
 * AgentController.ts
 * Manages the Phase 3 Browser Action & Control Engine.
 */

import { useAssistantStore } from "@/state/assistantStore";
import { perceivePage } from "./Perception";
import type { AgentPlan, AgentAction, TaskLogEntry } from "@/types";

const MAX_STEPS = 10;

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function logStep(message: string, isError = false) {
  const store = useAssistantStore.getState();
  const entry: TaskLogEntry = {
    id: uid(),
    timestamp: Date.now(),
    message,
    state: store.taskState,
    isError
  };
  store.addTaskLog(entry);
}

export async function startAgentTask(taskPrompt: string) {
  const store = useAssistantStore.getState();
  if (store.taskState !== "IDLE" && store.taskState !== "COMPLETED" && store.taskState !== "CANCELLED" && store.taskState !== "FAILED") {
    logStep("Agent is already running a task.", true);
    return;
  }

  store.setActiveTask(taskPrompt);
  store.clearTaskLogs();
  store.setTaskState("UNDERSTANDING");
  logStep(`Task started: "${taskPrompt}"`);

  let stepCount = 0;

  while (stepCount < MAX_STEPS) {
    const currentState = useAssistantStore.getState().taskState;
    if (currentState === "CANCELLED") {
      logStep("Task cancelled by user.");
      return;
    }

    try {
      store.setTaskState("UNDERSTANDING");
      logStep("Perceiving page context (DOM + Vision)...");
      const perception = await perceivePage(taskPrompt);
      const pageContext = perception.pageContext;

      if (!pageContext) {
        if (perception.url?.startsWith("file://")) {
          throw new Error("Cannot read this local file. Please ensure 'Allow access to file URLs' is enabled in chrome://extensions and then refresh this page.");
        } else if (perception.url?.startsWith("chrome://")) {
          throw new Error("Chrome extensions are not allowed to read chrome:// pages for security reasons.");
        }
        throw new Error("Could not extract page context. Please try reloading the page.");
      }

      store.setTaskState("PLANNING");
      logStep("Applying Privacy Firewall...");
      const { PrivacyEngine } = await import("@/privacy/PrivacyEngine");
      const privStart = performance.now();
      const sanitizedContext = await PrivacyEngine.sanitize(pageContext);
      const privLatency = Math.round(performance.now() - privStart);
      
      const pData = sanitizedContext.privacy;
      store.setPrivacyMetadata(pData); // Publish to UI
      store.updateSystemMetrics({ privacyLatencyMs: privLatency });

      if (pData.status === "PROTECTED") {
        logStep(`Privacy Scan: 🔒 Protected. Redacted ${pData.elementsRedacted} sensitive elements.`);
      }

      let plan: AgentPlan;
      const {
        isAutofillIntent,
        isExtractIntent,
        loadProfileVault,
        saveProfileVault,
        generateVaultAutofillPlan,
        extractProfileFromPageText,
      } = await import("@/vault/ProfileVault");

      if (isExtractIntent(taskPrompt)) {
        logStep("Scanning page to extract profile details...");
        const rawText = pageContext.text.join("\n");
        const extracted = extractProfileFromPageText(rawText);
        const count = Object.keys(extracted).length;
        if (count > 0) {
          await saveProfileVault(extracted);
          store.setTaskState("COMPLETED");
          logStep(`🔒 Extracted ${count} fields (${Object.keys(extracted).join(", ")}) and saved to your local Vault!`);
          return;
        } else {
          store.setTaskState("COMPLETED");
          logStep("No personal fields detected on this page to import.");
          return;
        }
      }

      const isAutofill = isAutofillIntent(taskPrompt);
      let isLocalAction = false;

      if (isAutofill) {
        logStep("🔒 Accessing on-device Profile Vault for NLP Mapping...");
        const vault = await loadProfileVault();
        const vaultKeys = Object.keys(vault).filter(k => (vault as any)[k] && (vault as any)[k].trim() !== "");
        
        if (vaultKeys.length === 0) {
           store.setTaskState("COMPLETED");
           logStep("Your Privacy Vault is currently empty. Please fill it first.");
           return;
        }

        // We append the available keys to the prompt so the LLM can map them using NLP without seeing the data.
        const nlpPrompt = `AUTOFILL COMMAND. Map the following available Vault Keys to the appropriate form fields on this page using Natural Language Processing.
Available Vault Keys: ${vaultKeys.join(", ")}
Output action 'type' or 'select' with value set exactly to the bracketed key name (e.g. '[email]', '[bankAccount]'). The client will securely substitute the real data.`;

        logStep("Requesting NLP field mapping from backend...");
        plan = await fetchActionPlan(nlpPrompt, sanitizedContext);
        
        // Secure On-Device Substitution (Privacy Firewall)
        let mappedCount = 0;
        for (const action of plan.actions) {
           if (action.value && typeof action.value === 'string' && action.value.startsWith('[') && action.value.endsWith(']')) {
              const key = action.value.slice(1, -1);
              if ((vault as any)[key]) {
                 action.value = (vault as any)[key];
                 mappedCount++;
              }
           }
        }
        
        plan.message = `Autofilling ${mappedCount} fields using NLP mapping (Zero cloud data exposure).`;
        logStep(`On-device NLP Planner: ${plan.message}`);
        
      } else {
        const { parseLocalCommand } = await import("./LocalCommandParser");
        const localPlan = parseLocalCommand(taskPrompt, pageContext);
        if (localPlan) {
          isLocalAction = true;
          plan = localPlan;
          logStep(`⚡ ${localPlan.message}`);
        } else {
          logStep("Requesting action plan from backend...");
          plan = await fetchActionPlan(taskPrompt, sanitizedContext);
        }
      }
      
      if (!plan || plan.actions.length === 0) {
        if (plan?.message && (plan.message.toLowerCase().includes("error") || plan.message.includes("429"))) {
          store.setTaskState("FAILED");
          logStep(plan.message, true);
          return;
        }
        store.setTaskState("COMPLETED");
        logStep("Task completed or no further actions required.");
        return;
      }

      if (plan.requiresConfirmation) {
        store.setTaskState("AWAITING_CONFIRMATION");
        store.setPendingPlan(plan);
        logStep(`Requires confirmation: ${plan.message}`);
        // We stop the loop here. The UI will call `confirmPlan()` or `cancelTask()`.
        return;
      }

      await executePlan(plan);

      if (isAutofill || isLocalAction) {
        store.setTaskState("COMPLETED");
        logStep(isLocalAction ? "⚡ On-device action completed successfully." : "Form autofilled successfully from on-device vault.");
        return;
      }
      
      // If executePlan succeeds without throwing, we loop to observe and plan again
      stepCount++;
      logStep(`Completed step ${stepCount}/${MAX_STEPS}`);
      
    } catch (err: any) {
      logStep(`Error: ${err.message}`, true);
      store.setTaskState("FAILED");
      return;
    }
  }

  logStep("Maximum steps reached without completion.", true);
  store.setTaskState("FAILED");
}

export async function confirmPlan() {
  const store = useAssistantStore.getState();
  const plan = store.pendingPlan;
  if (!plan) return;

  store.setPendingPlan(null);
  store.setTaskState("EXECUTING");
  logStep("User confirmed actions.");

  try {
    await executePlan(plan);
    // After executing a confirmed plan, we might want to continue the loop or just stop.
    // For simplicity, we complete. A more robust engine would resume the observe loop.
    store.setTaskState("COMPLETED");
    logStep("Task sequence completed.");
  } catch (err: any) {
    logStep(`Error executing confirmed plan: ${err.message}`, true);
    store.setTaskState("FAILED");
  }
}

async function fetchActionPlan(taskPrompt: string, context: any): Promise<AgentPlan> {
  const response = await fetch("http://localhost:8000/api/agent/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: taskPrompt, pageContext: context })
  });

  if (!response.ok) {
    throw new Error(`Planner backend returned ${response.status}`);
  }

  const data = await response.json();
  return data as AgentPlan;
}

async function executePlan(plan: AgentPlan) {
  const store = useAssistantStore.getState();
  store.setTaskState("EXECUTING");

  for (const action of plan.actions) {
    if (useAssistantStore.getState().taskState === "CANCELLED") {
      throw new Error("Task cancelled during execution.");
    }

    logStep(`Executing ${action.action}...`);
    
    // Validate Action Safety
    if (!validateAction(action)) {
      throw new Error(`Action validation failed: ${JSON.stringify(action)}`);
    }

    // Send action to the content script ActionExecutor
    await executeActionInTab(action);

    store.setTaskState("VERIFYING");
    logStep(`Verifying ${action.action}...`);
    
    // Basic wait for DOM updates
    await new Promise(r => setTimeout(r, 800));
  }
}

function validateAction(action: AgentAction): boolean {
  if (action.action === "navigate") {
    if (action.url.startsWith("javascript:") || action.url.startsWith("data:") || action.url.startsWith("vbscript:")) {
      return false; // Dangerous protocols
    }
  }
  if (action.action === "scroll") {
    if (action.amount && (action.amount > 3000 || action.amount < 0)) return false;
  }
  if (action.action === "wait") {
    if (action.milliseconds > 10000 || action.milliseconds < 0) return false;
  }
  return true;
}

async function executeActionInTab(action: AgentAction): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.tabs) {
    throw new Error("Chrome tabs API unavailable.");
  }
  
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab?.id) {
    throw new Error("No active tab found to execute action.");
  }

  if (action.action === "navigate") {
    await chrome.tabs.update(activeTab.id, { url: action.url });
    await new Promise(r => setTimeout(r, 2000)); // wait for navigation
    return;
  }

  const result = await chrome.tabs.sendMessage(activeTab.id, {
    type: "EXECUTE_ACTION",
    payload: action as any
  });

  if (!result || !result.success) {
    throw new Error(result?.errorCode || `Failed to execute ${action.action}`);
  }
}

export function stopTask() {
  useAssistantStore.getState().cancelTask();
}
