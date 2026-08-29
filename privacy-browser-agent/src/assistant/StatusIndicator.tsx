/**
 * StatusIndicator — Privacy status block.
 *
 * Clearly labeled as not-yet-implemented. Does not claim data is
 * being protected or filtered — it's a labeled placeholder.
 */

import React from "react";

export const StatusIndicator: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {/* Privacy status card */}
      <div className="bg-agent-surface rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔒</span>
          <h3 className="text-agent-text font-semibold text-sm">
            Privacy Mode
          </h3>
        </div>
        <p className="text-agent-text-muted text-xs leading-relaxed">
          Privacy Engine — Coming in Phase 5
        </p>
        <p className="text-agent-text-muted text-[11px] mt-2 leading-relaxed">
          When implemented, this module will:
        </p>
        <ul className="text-agent-text-muted text-[11px] mt-1 space-y-1 list-disc list-inside">
          <li>Detect and redact PII before processing</li>
          <li>Mask email addresses, phone numbers, and credentials</li>
          <li>Provide configurable redaction rules</li>
          <li>Show a real-time privacy dashboard</li>
        </ul>
      </div>

      {/* Current status */}
      <div className="bg-agent-surface rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">ℹ️</span>
          <h3 className="text-agent-text font-semibold text-sm">
            Current Status
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-agent-text-muted">Data Processing</span>
            <span className="text-agent-warning bg-agent-warning/10 px-2 py-0.5 rounded-full">
              Local Only
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-agent-text-muted">Network Requests</span>
            <span className="text-agent-success bg-agent-success/10 px-2 py-0.5 rounded-full">
              None
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-agent-text-muted">AI Backend</span>
            <span className="text-agent-text-muted bg-agent-surface-light px-2 py-0.5 rounded-full">
              Not Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
