# Privacy Browser Agent 🛡️ (SIH_26)

An intelligent, privacy-first browser agent that lives directly inside your web pages. It provides a draggable floating assistant, a native Chrome side panel, and deep page-aware AI understanding without compromising user security.

Currently implemented through **Phase 2**, the agent can actively "read" your current webpage, understand visible text, locate interactive buttons/forms, and use a real AI model to answer questions about the page context—all while strictly redacting sensitive data like passwords.

---

## 🏗️ Project Architecture

This repository is split into three main components:

1. **`privacy-browser-agent/` (The Chrome Extension)**
   - Built with React, TypeScript, and Tailwind CSS (Manifest V3).
   - Injects a Shadow-DOM protected floating avatar into web pages.
   - Houses the **Page Perception Engine** that extracts page context, filters out hidden elements/scripts, and registers interactive elements.
2. **`privacy-agent-dashboard/` (The Control Center)**
   - A companion React web app with a highly tactile Skeuomorphic design.
   - Allows real-time customization of the agent (size, anime preset avatars, image uploads) synchronized instantly via Chrome Storage.
3. **`backend/` (The AI Engine)**
   - A Python FastAPI server that handles secure communication with the LLM (Google Gemini).
   - Ensures that API keys are never exposed in the browser frontend.

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python](https://www.python.org/downloads/) (3.9+ recommended)
- Google Chrome browser

### 1. Start the Backend AI Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your API key:
   - Rename `.env.example` to `.env`.
   - Open `.env` and add your Google Gemini API key: `GEMINI_API_KEY=your_key_here`
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will now be running on `http://localhost:8000`.*

### 2. Build the Chrome Extension
1. Open a new terminal and navigate to the extension directory:
   ```bash
   cd privacy-browser-agent
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
   *This will generate a `dist/` folder containing the final extension.*

### 3. Load the Extension into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Turn on **"Developer mode"** (toggle in the top right corner).
3. Click **"Load unpacked"** in the top left.
4. Select the `privacy-browser-agent/dist` folder.
5. *Tip: Pin the "Privacy Browser Agent" icon to your Chrome toolbar for easy access!*

### 4. (Optional) Run the Control Center Dashboard
1. Navigate to the dashboard directory:
   ```bash
   cd privacy-agent-dashboard
   ```
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser to customize your floating avatar's appearance in real-time.

---

## 🧪 End-to-End Testing Guide

Once everything is installed and running, follow these steps to verify Phase 2 features:

### Test 1: Page Awareness (Wikipedia)
1. Open a Wikipedia article (e.g., [Apollo 11](https://en.wikipedia.org/wiki/Apollo_11)).
2. Open the Assistant Side Panel (Click the extension icon, or press `Ctrl+Shift+E`).
3. Type: *"What is this page?"* or *"Summarize the main points of this article."*
4. **Expected Result:** The assistant should successfully extract the webpage's paragraphs and headers, send them to the backend, and reply with an accurate summary based *only* on the current page.

### Test 2: Element Detection (Forms & Buttons)
1. Navigate to any website with forms or buttons (e.g., a GitHub repository page).
2. Ask the assistant: *"What buttons are available to click on this page?"* or *"What inputs are on this screen?"*
3. **Expected Result:** The assistant will list the interactive elements currently visible on the page (e.g., "I see a Sign In button, a Search input," etc.).

### Test 3: Dynamic Page Updates
1. Stay on the same tab, but click a link to navigate to a completely different webpage.
2. Ask the assistant: *"Where am I now?"*
3. **Expected Result:** The Context Manager detects the page change automatically. The AI should correctly identify your new location without you needing to reload the extension.

### Test 4: Privacy & Password Redaction
1. Go to any login page (e.g., `https://github.com/login`).
2. Type a fake password into the password box.
3. Open the Developer Tools (`F12`), go to the **Console**, and look for the `[Privacy Agent] Page Context extracted` debug log. Expand the object to view the extracted inputs.
4. **Expected Result:** You will see the password field was detected, but its value is strictly set to `[REDACTED]`. The actual password text is purposefully destroyed before it ever reaches the backend AI.
