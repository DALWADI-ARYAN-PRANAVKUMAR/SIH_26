# Development Guide

## Build Scripts
- `npm run dev`: Runs Vite in dev mode (best for Dashboard).
- `npm run build`: Compiles TypeScript and builds the Chrome Extension.
- `npm run watch`: Optional script to continuously build the extension.

## Hot Reloading in Chrome
Native hot-reloading for Chrome extensions is limited. When modifying content scripts (`src/extension/content/*`) or background scripts, you must open `chrome://extensions/` and click the reload icon for the Privacy Browser Agent.

Changes to Side Panel UI components are often picked up immediately if the panel is closed and reopened.
