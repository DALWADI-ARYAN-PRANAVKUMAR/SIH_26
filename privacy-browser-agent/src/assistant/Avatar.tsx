/**
 * Avatar — The floating circular button that represents the agent.
 *
 * Features:
 * - State-driven icon/animation (IDLE/THINKING/EXECUTING/SUCCESS/ERROR)
 * - Draggable via pointer events (not HTML5 drag — works better in shadow DOM)
 * - Position persists across reloads via chrome.storage.local
 * - Click toggles the chat panel
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAssistantStore } from "@/state/assistantStore";
import { getAvatarPosition, setAvatarPosition, getAvatarPrefs, onStorageChange } from "@/extension/storage";
import type { AssistantState, AvatarStyle } from "@/types";
const DEFAULT_RIGHT = 20;
const DEFAULT_BOTTOM = 20;

/** Map each state to its display icon based on style. */
function getStateIcon(state: AssistantState, style: AvatarStyle): string {
  if (style === "robot") {
    switch (state) {
      case "IDLE": return "🤖";
      case "LISTENING": return "🎙️";
      case "THINKING": return "⏳";
      case "EXECUTING": return "⚡";
      case "SUCCESS": return "✅";
      case "ERROR": return "❌";
    }
  }
  
  if (style === "minimal") {
    switch (state) {
      case "IDLE": return "⚪";
      case "LISTENING": return "〰️";
      case "THINKING": return "⚬";
      case "EXECUTING": return "◒";
      case "SUCCESS": return "✓";
      case "ERROR": return "✕";
    }
  }

  // Classic
  switch (state) {
    case "IDLE": return "✦";
    case "LISTENING": return "🎤";
    case "THINKING": return "◌";
    case "EXECUTING": return "⚙";
    case "SUCCESS": return "✓";
    case "ERROR": return "!";
  }
}



export const Avatar: React.FC = () => {
  const state = useAssistantStore((s) => s.state);

  // Style state
  const [avatarPrefs, setAvatarPrefs] = useState<{ style: AvatarStyle, image: string | null, size: number }>({
    style: "classic",
    image: null,
    size: 52
  });

  // Position state: stored as (x, y) from viewport top-left
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMoved = useRef(false);

  // Load saved position and style on mount, listen for changes
  useEffect(() => {
    // Load initial
    getAvatarPosition().then((saved) => {
      if (saved) {
        setPosition(saved);
      } else {
        // Default: bottom-right
        setPosition({
          x: window.innerWidth - avatarPrefs.size - DEFAULT_RIGHT,
          y: window.innerHeight - avatarPrefs.size - DEFAULT_BOTTOM,
        });
      }
    });

    getAvatarPrefs().then((prefs) => setAvatarPrefs(prefs));

    // Listen for real-time changes (from Dashboard website)
    const cleanup = onStorageChange((changes) => {
      setAvatarPrefs(prev => ({
        style: changes.avatarStyle !== undefined ? changes.avatarStyle : prev.style,
        image: changes.avatarImage !== undefined ? changes.avatarImage : prev.image,
        size: changes.avatarSize !== undefined ? changes.avatarSize : prev.size,
      }));
    });

    return cleanup;
  }, []);

  // Pointer down: start drag tracking
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!position) return;
      isDragging.current = true;
      hasMoved.current = false;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [position],
  );

  // Pointer move: update position if dragging
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // Only count as a drag if moved more than 5px (prevents accidental drag on click)
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved.current = true;
      }

      const newX = Math.max(
        0,
        Math.min(
          window.innerWidth - avatarPrefs.size,
          dragStart.current.posX + dx,
        ),
      );
      const newY = Math.max(
        0,
        Math.min(
          window.innerHeight - avatarPrefs.size,
          dragStart.current.posY + dy,
        ),
      );

      setPosition({ x: newX, y: newY });
    },
    [avatarPrefs.size],
  );

  // Pointer up: end drag, persist position
  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // If didn't actually move, treat as click
    if (!hasMoved.current) {
      // Instead of toggling a local panel, tell background to open Side Panel
      chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" }, (response) => {
        if (chrome.runtime.lastError || response?.error) {
          console.warn("Chrome blocked programmatic side panel opening. Please click the toolbar icon.");
        }
      });
    } else if (position) {
      // Persist dragged position
      setAvatarPosition(position);
    }
  }, [position]);

  if (!position) return null;

  const isAnimating = state === "THINKING" || state === "LISTENING";
  const isSpinning = state === "EXECUTING";

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${avatarPrefs.size}px`,
        height: `${avatarPrefs.size}px`,
        zIndex: 2147483647,
        pointerEvents: "auto",
        touchAction: "none",
        backgroundColor: avatarPrefs.image ? "transparent" : "var(--agent-bg)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--agent-primary)",
        fontWeight: "bold",
        fontSize: `${Math.max(16, avatarPrefs.size * 0.4)}px`,
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        boxShadow: "6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)",
        border: "none",
        transition: "background-color 0.2s ease, transform 0.1s ease",
        animation: isAnimating ? "agentPulse 2s ease-in-out infinite" : isSpinning ? "agentSpin 2s linear infinite" : "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      title={`Privacy Agent — ${state}`}
      role="button"
      aria-label="Privacy Browser Agent"
    >
      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes agentSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {avatarPrefs.image ? (
        <img 
          src={avatarPrefs.image} 
          alt="Avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
        />
      ) : (
        getStateIcon(state, avatarPrefs.style)
      )}
    </div>
  );
};
