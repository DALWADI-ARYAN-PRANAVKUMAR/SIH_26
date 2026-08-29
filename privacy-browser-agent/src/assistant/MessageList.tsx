/**
 * MessageList — Renders the scrolling conversation view.
 *
 * Auto-scrolls to the bottom when new messages arrive.
 */

import React, { useEffect, useRef } from "react";
import { useAssistantStore } from "@/state/assistantStore";
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
            ? "bg-agent-primary text-white rounded-br-sm shadow-sm"
            : isSystem
              ? "bg-agent-error/20 text-agent-error border border-agent-error/30 rounded-bl-sm backdrop-blur-md"
              : "bg-agent-surface text-agent-text rounded-bl-sm border border-white/20 dark:border-white/10 backdrop-blur-md shadow-sm"
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-3"
      style={{ minHeight: 0 }}
    >
      {messages.length === 0 ? (
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
