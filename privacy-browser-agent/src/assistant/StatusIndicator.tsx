import React from "react";
import { useAssistantStore } from "@/state/assistantStore";

export const StatusIndicator: React.FC = () => {
  const meta = useAssistantStore((s) => s.lastPrivacyMetadata);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {/* Privacy Dashboard */}
      <div className="bg-agent-bg rounded-xl p-4 mb-5 shadow-neu">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔒</span>
          <h3 className="text-agent-text font-semibold text-sm">
            Privacy Firewall
          </h3>
        </div>
        
        {meta ? (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-agent-text-muted">Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                meta.status === "PROTECTED" ? "bg-agent-success/20 text-agent-success" : 
                meta.status === "ERROR" ? "bg-agent-error/20 text-agent-error" :
                "bg-agent-primary/10 text-agent-primary"
              }`}>
                {meta.status === "PROTECTED" ? "Protected" : meta.status === "NO_SENSITIVE_DATA_FOUND" ? "Active" : meta.status}
              </span>
            </div>
            
            <div className="space-y-1 mb-4">
              <p className="text-agent-text-muted text-xs">✓ {meta.elementsInspected} elements inspected</p>
              <p className="text-agent-text-muted text-xs">✓ {meta.sensitiveElementsDetected} sensitive elements found</p>
              <p className="text-agent-success text-xs font-medium">✓ {meta.elementsRedacted} elements redacted locally</p>
            </div>
            
            {meta.findings.length > 0 && (
              <div className="border-t border-agent-surface-light pt-3">
                <p className="text-agent-text text-xs mb-2">Categories Protected:</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(meta.findings.map((f: any) => f.category))).map((cat: any) => (
                    <span key={cat} className="text-[10px] bg-agent-surface-light text-agent-text-muted px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-agent-text-muted mt-4 italic text-center">
              Scan completed in {meta.scanDurationMs}ms
            </p>
          </div>
        ) : (
          <p className="text-agent-text-muted text-xs mt-3 leading-relaxed">
            Privacy Engine is active and waiting for the next page scan.
          </p>
        )}
      </div>

      <div className="bg-agent-warning/10 border border-agent-warning/20 rounded-xl p-3">
        <p className="text-agent-warning text-[11px] leading-relaxed font-medium">
          Note: Raw sensitive values never cross the local boundary. Only semantic placeholders (e.g., [EMAIL]) are sent to the AI planner.
        </p>
      </div>
    </div>
  );
};
