/**
 * InputBox — Text input with send button for composing messages.
 *
 * Calls AssistantController.sendMessage() — never touches AgentEngine directly.
 */

import React, { useState, useCallback, useRef } from "react";
import { useAssistantStore } from "@/state/assistantStore";
import { sendMessage } from "@/core/AssistantController";

export const InputBox: React.FC = () => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const state = useAssistantStore((s) => s.state);

  const isProcessing = state !== "IDLE" && state !== "LISTENING";

  const handleSend = useCallback(() => {
    if (!text.trim() || isProcessing) return;
    sendMessage(text);
    setText("");
    inputRef.current?.focus();
  }, [text, isProcessing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex items-center gap-2 p-4">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isProcessing ? "Processing..." : "Type '/do' for actions, or chat..."}
        disabled={isProcessing}
        className="flex-1 bg-agent-bg shadow-neu-inset rounded-lg px-3 py-2 text-sm text-agent-text placeholder-agent-text-muted outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isProcessing}
        className="bg-agent-primary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-neu active:shadow-neu-inset"
      >
        Send
      </button>
    </div>
  );
};
