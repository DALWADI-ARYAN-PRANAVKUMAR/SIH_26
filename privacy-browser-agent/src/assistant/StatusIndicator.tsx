import React from "react";
import { useAssistantStore } from "@/state/assistantStore";

export const StatusIndicator: React.FC = () => {
  const meta = useAssistantStore((s) => s.lastPrivacyMetadata);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {/* Privacy Dashboard */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 mb-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔒</span>
          <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
            Privacy Firewall
          </h3>
        </div>
        
        {meta ? (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500">Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                meta.status === "PROTECTED" ? "bg-agent-success/20 text-agent-success" : 
                meta.status === "ERROR" ? "bg-agent-error/20 text-red-500" :
                "bg-zinc-900 text-white/10 text-zinc-900 dark:text-zinc-100 font-semibold"
              }`}>
                {meta.status === "PROTECTED" ? "Protected" : meta.status === "NO_SENSITIVE_DATA_FOUND" ? "Active" : meta.status}
              </span>
            </div>
            
            <div className="space-y-1 mb-4">
              <p className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 text-xs">✓ {meta.elementsInspected} elements inspected</p>
              <p className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 text-xs">✓ {meta.sensitiveElementsDetected} sensitive elements found</p>
              <p className="text-agent-success text-xs font-medium">✓ {meta.elementsRedacted} elements redacted locally</p>
            </div>
            
            {meta.findings.length > 0 && (
              <div className="border-t border-agent-surface-light pt-3">
                <p className="text-zinc-900 dark:text-zinc-100 text-xs mb-2">Categories Protected:</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(meta.findings.map((f: any) => f.category))).map((cat: any) => (
                    <span key={cat} className="text-[10px] bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 mt-4 italic text-center">
              Scan completed in {meta.scanDurationMs}ms
            </p>
          </div>
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 text-xs mt-3 leading-relaxed">
            Privacy Engine is active and waiting for the next page scan.
          </p>
        )}
      </div>

      <div className="bg-amber-100 border border-amber-200 rounded-xl p-3">
        <p className="text-amber-600 text-[11px] leading-relaxed font-medium">
          Note: Raw sensitive values never cross the local boundary. Only semantic placeholders (e.g., [EMAIL]) are sent to the AI planner.
        </p>
      </div>
    </div>
  );
};
