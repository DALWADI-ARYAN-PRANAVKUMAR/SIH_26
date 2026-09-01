import React, { useEffect, useState } from "react";
import { useAssistantStore } from "@/state/assistantStore";

export const SystemMetrics: React.FC = () => {
  const metrics = useAssistantStore((s) => s.systemMetrics);
  const [ram, setRam] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize) {
        setRam(Math.round(memory.usedJSHeapSize / (1024 * 1024)));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <h3 className="text-xs font-semibold text-agent-text mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-agent-primary animate-pulse"></span>
          System Telemetry
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-agent-text-muted">RAM Usage</span>
            <span className="text-sm font-medium text-agent-text">{ram > 0 ? `${ram} MB` : 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-agent-text-muted">WebGPU Status</span>
            <span className={`text-sm font-medium ${metrics.gpuActive ? 'text-agent-success' : 'text-agent-text'}`}>
              {metrics.gpuActive ? 'Active' : 'Idle'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-agent-text-muted">Vision Latency</span>
            <span className="text-sm font-medium text-agent-text">{metrics.visionLatencyMs} ms</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-agent-text-muted">Privacy Firewall</span>
            <span className="text-sm font-medium text-agent-text">{metrics.privacyLatencyMs} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
