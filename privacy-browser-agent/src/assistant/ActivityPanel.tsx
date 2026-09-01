/**
 * ActivityPanel — Running log of pipeline stage events.
 *
 * Renders ActivityEvent[] from the store as a checklist with ✓ / ⏳ / ✗ icons.
 */

import React, { useEffect, useRef } from "react";
import { useAssistantStore } from "@/state/assistantStore";
import type { ActivityStatus } from "@/types";

function getStatusIcon(status: ActivityStatus): string {
  switch (status) {
    case "done":
      return "✓";
    case "pending":
      return "⏳";
    case "error":
      return "✗";
  }
}

function getStatusColor(status: ActivityStatus): string {
  switch (status) {
    case "done":
      return "text-agent-success";
    case "pending":
      return "text-agent-warning";
    case "error":
      return "text-agent-error";
  }
}

export const ActivityPanel: React.FC = () => {
  const activities = useAssistantStore((s) => s.activities);
  const clearActivities = useAssistantStore((s) => s.clearActivities);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with clear button */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-agent-text-muted text-xs font-medium">
          Pipeline Activity
        </span>
        {activities.length > 0 && (
          <button
            onClick={clearActivities}
            className="text-agent-text-muted text-[10px] hover:text-agent-text transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ minHeight: 0 }}
      >
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-agent-text-muted text-xs">
            No activity yet
          </div>
        ) : (
          <div className="space-y-1.5">
            {activities.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-2 text-xs"
              >
                <span
                  className={`${getStatusColor(event.status)} flex-shrink-0 w-4 text-center font-bold`}
                >
                  {getStatusIcon(event.status)}
                </span>
                <span className="text-agent-text leading-relaxed">
                  {event.label}
                </span>
                <span className="text-agent-text-muted text-[10px] ml-auto flex-shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
