/**
 * MessageList — Renders the scrolling conversation view.
 *
 * Auto-scrolls to the bottom when new messages arrive.
 */

import React, { useEffect, useRef } from "react";
import { useAssistantStore } from "@/state/assistantStore";
import { stopTask, confirmPlan } from "@/core/AgentController";
import type { Message } from "@/types";

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-agent-bg text-agent-primary rounded-br-sm shadow-neu-inset"
            : isSystem
              ? "bg-agent-bg text-agent-error rounded-bl-sm shadow-neu border border-agent-error/50"
              : "bg-agent-bg text-agent-text rounded-bl-sm shadow-neu"
        }`}
      >
        {message.content}
        <div
          className={`text-[10px] mt-1 ${
            isUser ? "text-indigo-200" : "text-agent-text-muted"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export const MessageList: React.FC = () => {
  const messages = useAssistantStore((s) => s.messages);
  const state = useAssistantStore((s) => s.state);
  const taskState = useAssistantStore((s) => s.taskState);
  const activeTask = useAssistantStore((s) => s.activeTask);
  const taskLogs = useAssistantStore((s) => s.taskLogs);
  const pendingPlan = useAssistantStore((s) => s.pendingPlan);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, state, taskState, taskLogs]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-3"
      style={{ minHeight: 0 }}
    >
      {/* --- Phase 3 Task Dashboard --- */}
      {activeTask && (
        <div className="bg-agent-bg shadow-neu rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-agent-text text-sm">✦ Browser Agent Task</h3>
            {(taskState !== "IDLE" && taskState !== "COMPLETED" && taskState !== "CANCELLED" && taskState !== "FAILED") ? (
              <button 
                onClick={stopTask}
                className="text-xs bg-agent-bg shadow-neu active:shadow-neu-inset text-agent-error font-medium px-3 py-1.5 rounded-lg"
              >
                Stop Agent
              </button>
            ) : (
              <button 
                onClick={() => useAssistantStore.getState().cancelTask()}
                className="text-xs bg-agent-bg shadow-neu active:shadow-neu-inset text-agent-text-muted hover:text-agent-text font-medium px-2 py-1 rounded-lg"
                title="Dismiss task"
              >
                ✕ Clear
              </button>
            )}
          </div>
          <p className="text-xs text-agent-text-muted italic mb-3">"{activeTask}"</p>
          
          <div className="space-y-1 mb-3">
            {taskLogs.map((log) => (
              <div key={log.id} className={`text-xs flex items-start gap-2 ${log.isError ? 'text-red-400' : 'text-agent-text'}`}>
                <span className="opacity-50 mt-0.5">•</span>
                <span>{log.message}</span>
              </div>
            ))}
            {(taskState === "UNDERSTANDING" || taskState === "PLANNING" || taskState === "EXECUTING" || taskState === "VERIFYING") && (
              <div className="text-xs text-agent-primary flex items-center gap-2 mt-2">
                <span className="w-3 h-3 rounded-full border-2 border-agent-primary border-t-transparent animate-spin"></span>
                {taskState}...
              </div>
            )}
          </div>

          {taskState === "AWAITING_CONFIRMATION" && pendingPlan && (
            <div className="bg-agent-warning/10 border border-agent-warning/20 p-3 rounded-lg mt-3">
              <p className="text-xs text-agent-warning font-semibold mb-1">⚠ Confirmation Required</p>
              <p className="text-xs text-agent-text mb-3">{pendingPlan.message}</p>
              <div className="flex justify-end gap-2">
                <button onClick={stopTask} className="text-xs px-3 py-1.5 text-agent-text hover:bg-agent-surface-light rounded">Cancel</button>
                <button onClick={confirmPlan} className="text-xs px-3 py-1.5 bg-agent-warning text-black font-semibold rounded hover:bg-opacity-90">Confirm</button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ------------------------------ */}

      {messages.length === 0 && !activeTask ? (
        <div className="flex flex-col items-center justify-center h-full text-agent-text-muted text-sm">
          <div className="text-3xl mb-3">✦</div>
          <p className="text-center">
            Privacy Browser Agent
            <br />
            <span className="text-xs">
              Type &quot;help&quot; to see what I can do
            </span>
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {/* Typing indicator when thinking */}
          {(state === "THINKING" || state === "EXECUTING") && (
            <div className="flex justify-start mb-3">
              <div className="bg-agent-surface border border-white/20 dark:border-white/10 backdrop-blur-md shadow-sm rounded-xl px-4 py-2.5 rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-agent-text-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-agent-text-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-agent-text-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
