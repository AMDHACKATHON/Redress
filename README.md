# Redress — AI Complaint Resolution Agent

> Turn your complaint into a formal letter and escalate to regulators if ignored. Any country. Any sector.

🔗 **Live App:** https://redressamd.vercel.app
🤗 **HuggingFace Space:** https://huggingface.co/spaces/samkiel/redress

---

## What is Redress?

Most people have a legitimate complaint against a bank, telco, utility provider, landlord, or government agency but have no idea how to formally escalate it. They either give up, send an ineffective email, or don't know which regulatory body to contact.

Redress solves that. It's an AI agent that:
- Understands your complaint through a short conversation
- Drafts a professionally structured complaint letter
- Identifies the right channel and regulatory body for your country and sector
- Generates an escalation letter to regulators if your complaint is ignored
- Lets you download every letter as a PDF

---

## Demo

![Redress Demo](./demo.gif)

---

## How It Works

**Stage 1 — Understand**
The agent asks up to 3 clarifying questions to gather the key details: organization name, nature of the issue, date it occurred, and any prior contact attempts.

**Stage 2 — Draft**
Once enough context is gathered, the agent generates a formal complaint letter with the correct recipient, recommended channel, and relevant regulatory body details.

**Stage 3 — Escalate**
If the user indicates their complaint was ignored, the agent generates an escalation letter addressed directly to the regulatory body, including step-by-step filing instructions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js + Google OAuth |
| Database | MongoDB + Mongoose |
| State Management | Zustand |
| Web Search | Tavily |
| PDF Generation | jsPDF |
| Deployment | Vercel + HuggingFace Spaces |

> Note: This project was built for the AMD Developer Hackathon 2026. AMD Developer Cloud credits were applied for on May 5th but were not received before the submission deadline. The agent logic is fully compatible with AMD's OpenAI-compatible API and can be switched by updating two environment variables.

---

## Features

- Email + password registration and login
- Google OAuth
- Create and manage multiple complaint sessions
- Multi-turn conversational agent
- Formal complaint letter generation
- Regulatory body detection with live web search via Tavily
- Escalation letter generation
- PDF download for all letters
- Complaint history with stage tracking
- Admin dashboard
- Mobile responsive

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB URI
- Groq or AMD Developer Cloud API key
- Tavily API key
- Google OAuth credentials (optional)

### Installation

```bash
git clone https://github.com/AMDHACKATHON/Redress
cd Redress
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```
MONGODB_URI=
AMD_API_KEY=
AMD_API_URL=https://api.groq.com/openai/v1/chat/completions
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TAVILY_API_KEY=
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Project Structure

```
app/
  (auth)/          — Login and register pages
  (dashboard)/     — Protected dashboard, complaint chat, profile
  admin/           — Admin dashboard
  api/             — All API routes (auth, complaints, letters, profile)
components/
  letter/          — LetterDisplay, PDFDownloadButton
lib/
  models/          — Mongoose models
  mongodb.ts       — DB connection
  api.ts           — Axios instance
  store.ts         — Zustand store
  search.ts        — Tavily search utility
types/
  index.ts         — TypeScript interfaces
```

---

## Team

| Name | Role | GitHub |
|---|---|---|
| Ezekiel Samuel | Lead Engineer | [@samkiell](https://github.com/samkiell) |
| Zabdiel Anyaogu | Frontend + Demo |  [@fwesh](https://github.com/fwesh001) |

---

## Hackathon

Built for the **AMD Developer Hackathon 2026** on [lablab.ai](https://lablab.ai/ai-hackathons/amd-developer)
Track: AI Agents & Agentic Workflows
Prize pool: $10,000 + AMD Radeon AI PRO R9700 GPU

---

*Redress — AMD Developer Hackathon 2026*