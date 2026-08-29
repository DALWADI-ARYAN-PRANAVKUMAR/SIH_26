import React from "react";
import { createRoot } from "react-dom/client";
import { SidePanelApp } from "./SidePanelApp";
import "@/styles/global.css";
import { initializeAssistant } from "@/core/AssistantController";

const root = document.getElementById("sidepanel-root");
if (root) {
  // Initialize state sync before rendering
  initializeAssistant();
  
  createRoot(root).render(
    <React.StrictMode>
      <SidePanelApp />
    </React.StrictMode>,
  );
}
