# eKosova Smart Assist

An AI-powered assistant for Kosovo's public services — helping citizens find information and enabling call-center agents to respond faster and more accurately.

Built as a hackathon MVP for ITP Momentum.

---

## What it does

**For citizens** — a floating chat widget injected into `ekosova.rks-gov.net` that understands natural-language questions and streams answers about public services (documents needed, steps, estimated time).

**For agents** — a React dashboard where call-center staff can view incoming citizen requests, get an AI-generated Co-Pilot analysis for each request (suggested answer, key points, tone tips), and ask follow-up questions in a live chat thread.

**Browser extension** — a Chrome extension that injects the citizen widget into the real eKosova site and silently forwards escalation tickets to the agent dashboard via `chrome.storage.local`.

---

## Project structure

```
momentum/
├── ekosova-smart-assist/   # React app (citizen portal + agent dashboard)
└── ekosova-extension/      # Chrome extension (citizen widget + bridge)
```

---

## Prerequisites

- Node.js 18+
- An OpenAI API key (`gpt-4o-mini`)
- Google Chrome (for the extension)

---

## 1. Run the React app

```bash
cd ekosova-smart-assist
npm install
```

Create a `.env` file in `ekosova-smart-assist/`:

```
VITE_OPENAI_API_KEY=sk-your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Routes

| Path | Page |
|------|------|
| `/` | Landing page |
| `/citizen` | Citizen self-service portal |
| `/agent` | Agent dashboard + Co-Pilot |
| `/catalog` | Full service catalog |
| `/service/:id` | Individual service detail |

---

## 2. Load the Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `ekosova-extension/` folder
4. Open `ekosova-extension/apikey.js` and paste your OpenAI key:
   ```js
   var OPENAI_KEY = 'sk-your-key-here';
   ```

The extension activates on `ekosova.rks-gov.net`, `rks-gov.net`, and `localhost:5173`.

### How the extension works

- **`content.js`** — injects the chat widget (shadow DOM) into the eKosova site
- **`apikey.js`** — holds the OpenAI key (never committed — listed in `.gitignore`)
- **`bridge.js`** — content script on `localhost:5173` that polls `chrome.storage.local` and pushes new tickets into the React app's `localStorage`
- **`popup.html`** — extension popup with a link to the agent dashboard

When a citizen clicks "Connect with an agent", a ticket is saved silently to `chrome.storage.local`. The bridge script picks it up and the agent dashboard updates in real time — no redirect for the citizen.

---

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_OPENAI_API_KEY` | `ekosova-smart-assist/.env` | Powers citizen widget + Co-Pilot AI |
| `OPENAI_KEY` | `ekosova-extension/apikey.js` | Powers the extension's chat widget |

Both files are excluded from git via `.gitignore`.

---

## Tech stack

- **React 19** + TypeScript + Vite
- **Tailwind CSS v3**
- **Lucide React** icons
- **React Router v7**
- **OpenAI API** — `gpt-4o-mini` with streaming (SSE)
- **Chrome Extension** — Manifest V3, `chrome.storage.local`
