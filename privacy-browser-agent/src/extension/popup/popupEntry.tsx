import React from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";
import "@/styles/global.css";

const root = document.getElementById("popup-root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  );
}
