/* ===================================================================
 * Privacy Browser Agent — Shared Types
 * All type definitions used across the extension.
 * =================================================================== */

// --------------- State Machine ---------------

/**
 * The finite set of states the assistant can be in.
 * AssistantController owns transitions; UI only reads.
 */
export type AssistantState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "EXECUTING"
  | "SUCCESS"
  | "ERROR";

// --------------- Messages ---------------

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

// --------------- Activity Log ---------------

export type ActivityStatus = "pending" | "done" | "error";

export interface ActivityEvent {
  id: string;
  label: string;
  status: ActivityStatus;
  timestamp: number;
}

// --------------- Pipeline Interfaces ---------------

/** Output of the Perception module — page context extraction. */
export interface PerceptionResult {
  pageText: string;
  url: string;
  title: string;
  pageContext?: PageContext;
}

/** Input/output of the Privacy module — redaction. */
export interface PrivacyResult {
  sanitizedText: string;
  redactedFields: string[];
}

/** Output of the Reasoning module — LLM response. */
export interface ReasoningResult {
  reply: string;
  confidence: number;
}

/** Output of the Action module — browser action execution. */
export interface ActionResult {
  status: "success" | "noop" | "error";
  description: string;
}

/** Full pipeline response returned by AgentEngine. */
export interface AgentResponse {
  perception: PerceptionResult;
  privacy: PrivacyResult;
  reasoning: ReasoningResult;
  action: ActionResult;
}

// --------------- Extension Messaging ---------------

export type ExtensionMessageType =
  | "GET_STATUS"
  | "SET_STATUS"
  | "STATUS_CHANGED"
  | "TOGGLE_ASSISTANT"
  | "GET_PAGE_CONTEXT";

export interface ExtensionMessage {
  type: ExtensionMessageType;
  payload?: Record<string, unknown>;
}

// --------------- Phase 2: Page Perception ---------------

export interface HeadingContext {
  level: number;
  text: string;
}

export interface InteractiveElement {
  id: string; // Registry internal ID (e.g. button_001)
  type: string; // e.g. "button", "a", "input"
  text?: string;
  ariaLabel?: string | null;
  role?: string | null;
  title?: string | null;
  href?: string | null;
  disabled?: boolean;
}

export interface InputElement extends InteractiveElement {
  inputType?: string;
  placeholder?: string | null;
  name?: string | null;
  hasValue?: boolean;
  value?: string; // [REDACTED] for passwords
  checked?: boolean;
  required?: boolean;
}

export interface SelectElement extends InteractiveElement {
  name?: string | null;
  options: { text: string; value: string; selected: boolean }[];
}

export interface FormContext {
  id: string; // Internal ID
  name?: string | null;
  action?: string | null;
}

export interface PageContext {
  page: {
    url: string;
    title: string;
    domain: string;
    language?: string;
  };
  headings: HeadingContext[];
  text: string[];
  elements: {
    buttons: InteractiveElement[];
    links: InteractiveElement[];
    inputs: InputElement[];
    selects: SelectElement[];
    checkboxes: InputElement[];
    forms: FormContext[];
  };
  timestamp: number;
}


// --------------- Storage ---------------

export interface AvatarPosition {
  x: number;
  y: number;
}

export type AvatarStyle = "classic" | "robot" | "minimal" | "custom";

export interface StorageData {
  avatarPosition?: AvatarPosition;
  assistantEnabled?: boolean;
  avatarStyle?: AvatarStyle;
  avatarImage?: string | null;
  avatarSize?: number;
}

// --------------- Store Shape ---------------

export interface AssistantStoreState {
  // State machine
  state: AssistantState;
  setState: (state: AssistantState) => void;

  // Chat messages
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // Activity log
  activities: ActivityEvent[];
  addActivity: (activity: ActivityEvent) => void;
  updateActivity: (id: string, updates: Partial<ActivityEvent>) => void;
  clearActivities: () => void;

  // Panel visibility
  isPanelOpen: boolean;
  togglePanel: () => void;
  setPanel: (open: boolean) => void;

  // Active tab (chat vs activity)
  activeTab: "chat" | "activity" | "privacy";
  setActiveTab: (tab: "chat" | "activity" | "privacy") => void;
}
