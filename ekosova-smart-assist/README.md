# eKosova Smart Assist

> **Shërbime publike më të qarta, më të shpejta dhe më gjithëpërfshirëse.**
>
> ⚠️ Hackathon Prototype – Not an official eKosova system. All data is simulated.

---

## Problem

Public service information in Kosovo is fragmented, inconsistent, and often difficult for citizens to navigate. Call center agents frequently provide different answers to the same questions because they lack a unified, verified reference. Citizens with varying digital literacy and language needs are especially underserved.

## Solution

**eKosova Smart Assist** is a two-experience web prototype:

1. **Citizen Smart Assist** — embedded inside a mock eKosova citizen portal, helping citizens find the right public service using natural-language Albanian queries.
2. **Agent Co-Pilot** — a dedicated dashboard for call center agents that shows real-time citizen requests, verified service information, and copy-ready standardized response templates.

---

## Key Features

### Citizen Side (`/citizen`)
- Natural-language search in Albanian
- Service recommendation with confidence scoring (high/medium/low match)
- Simple explanation mode ("Ma shpjego më thjeshtë")
- Step-by-step instructions and required documents
- FAQ section per service
- "Request agent help" — creates a support request visible in the Agent Dashboard
- Text-to-speech (browser SpeechSynthesis)
- Font size toggle, high-contrast mode
- Language switcher UI (Shqip / English / Serbian)
- Recent search history (LocalStorage)
- Popular services section

### Agent Co-Pilot (`/agent`)
- Real-time list of citizen support requests from LocalStorage
- Co-Pilot panel: citizen context + verified service info + standardized response template
- One-click copy of response template
- Mark requests as In Progress / Resolved
- Simulated SMS/email send and escalation buttons
- Agent search: type any citizen question, get service recommendations
- Standard templates library (Greeting, Missing Docs, Technical, Escalation, Closing)
- Statistics dashboard

### Service Catalogue (`/catalog`)
- All 7 services with category filters and search
- Service detail pages with full procedure, FAQs, agent template, related services

### Landing Page (`/`)
- Problem/solution narrative
- Before vs After comparison
- Demo impact estimates
- One-click entry to citizen or agent experience

---

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173)

---

## Demo Flow

1. Open `/` — landing page
2. Click **"Hyr si qytetar"**
3. Click **"Demo skenar"** button — it auto-fills *"Më duhet dokument që tregon ku jetoj"*
4. System recommends **Certifikatë e Vendbanimit** with high confidence
5. Click **"Ma shpjego më thjeshtë"** — simpler explanation appears
6. Click **"Kërko ndihmë nga agjenti"** — request saved to LocalStorage
7. Navigate to `/agent`
8. Agent sees the citizen request in the dashboard
9. Click **"Hap Co-Pilot"**
10. Agent sees citizen context, verified steps, and the standardized response template
11. Click **"Kopjo"** — template copied to clipboard (toast appears: "Përgjigjja u kopjua.")
12. Click **"Shëno si zgjidhur"** — request status updated

---

## Technical Architecture

```
src/
├── types/index.ts                — TypeScript interfaces
├── data/services.ts              — Mock catalogue (7 services) + agent templates
├── utils/
│   ├── search.ts                 — Fuzzy keyword search with confidence scoring
│   └── storage.ts                — LocalStorage CRUD
├── context/
│   ├── AccessibilityContext.tsx  — Font size, contrast, language state
│   └── ToastContext.tsx          — Global toast notifications
├── components/
│   ├── CitizenHeader.tsx         — eKosova-style nav + accessibility controls
│   ├── AgentSidebar.tsx          — Internal agent navigation
│   ├── ServiceResultCard.tsx     — Expandable search result with all actions
│   ├── CoPilotPanel.tsx          — Full Co-Pilot slide-over panel
│   ├── RequestCard.tsx           — Compact request list item
│   ├── TemplateCard.tsx          — Copyable agent template
│   ├── StatsCard.tsx             — KPI metric card
│   └── ConfidenceBadge.tsx       — Color-coded match confidence indicator
└── pages/
    ├── Landing.tsx               — /
    ├── CitizenPortal.tsx         — /citizen
    ├── AgentDashboard.tsx        — /agent
    ├── ServiceCatalog.tsx        — /catalog
    └── ServiceDetail.tsx         — /service/:id
```

**Tech stack:** React 18 · TypeScript · Vite · Tailwind CSS v3 · React Router v7 · Browser LocalStorage · Browser SpeechSynthesis API

No backend, no paid APIs, no real eKosova integration. All data is mock/demo.

---

## Services in Catalogue

| # | Service | Category |
|---|---------|----------|
| 1 | Certifikatë e Lindjes | Dokumente personale |
| 2 | Certifikatë e Vendbanimit | Dokumente personale |
| 3 | Ndërrimi i Adresës | Gjendja civile |
| 4 | Aplikim për Dokument Personal | Dokumente personale |
| 5 | Regjistrim i Biznesit | Biznes |
| 6 | Tatimi në Pronë | Financa publike |
| 7 | Aplikim për Ndihmë Sociale | Mirëqenie sociale |

---

## Future Improvements

- Real eKosova API integration
- Full Albanian/English/Serbian translation
- Authentication (citizen login, agent roles)
- Backend with proper persistence and audit trail
- AI-powered search (embeddings / LLM)
- WCAG 2.1 AA compliance audit
- Mobile app wrapper
- Analytics and feedback collection

---

*Hackathon Prototype 2024 — eKosova Challenge*
