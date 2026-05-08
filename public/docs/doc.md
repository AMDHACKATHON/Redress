# Redress — Project Documentation

**Version:** 2.0.0
**Last Updated:** May 8, 2026
**Hackathon:** AMD Developer Hackathon 2026
**GitHub:** https://github.com/AMDHACKATHON/Redress
**Track:** AI Agents & Agentic Workflows

---

## 1. Project Overview

Redress is an AI-powered complaint resolution agent. Users describe their problem in plain language, the agent drafts a formal complaint letter, identifies the right channel and regulatory body, and escalates if the complaint is ignored. Works globally across any country and sector.

---

## 2. Team

| Name | Handle | Role |
|---|---|---|
| Ezekiel Samuel | samkiel | Lead Engineer — Full Stack + Agent |
| Zabdiel Anyaogu | Fwesh | Frontend — Profile, Settings, Legal Pages, Demo Video |

---

## 3. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (credentials provider) |
| Database | MongoDB + Mongoose |
| State | Zustand |
| LLM | AMD Developer Cloud API |
| PDF | jspdf |
| Deployment | Vercel + HuggingFace Space |

---

## 4. Task Allocation

### SAMKIEL — Full Stack + Agent Logic

#### Infrastructure
- [x] Next.js scaffold + folder structure
- [x] `lib/api.ts` — Axios instance
- [x] `lib/store.ts` — Zustand store
- [x] `types/index.ts` — TypeScript interfaces
- [ ] `lib/mongodb.ts` — MongoDB connection
- [ ] Mongoose models (User, Complaint, Message, Letter, EscalationLetter)
- [ ] NextAuth setup

#### Pages
- [x] Landing page (`/`)
- [x] Login page (`/login`)
- [x] Register page (`/register`)
- [x] Dashboard — complaint history (`/dashboard`)
- [x] Complaint chat + letter interface (`/dashboard/complaint/[id]`)

#### API Routes
- [ ] `POST /api/auth/register`
- [ ] `GET /api/auth/me`
- [ ] `POST /api/complaints/start`
- [ ] `GET /api/complaints`
- [ ] `GET /api/complaints/[id]`
- [ ] `DELETE /api/complaints/[id]`
- [ ] `POST /api/complaints/[id]/message` — agent logic lives here
- [ ] `GET /api/complaints/[id]/messages`
- [ ] `POST /api/complaints/[id]/letter/generate`
- [ ] `GET /api/complaints/[id]/letter`
- [ ] `POST /api/complaints/[id]/letter/escalate`
- [ ] `GET /api/complaints/[id]/letter/escalation`
- [ ] `GET /api/profile`
- [ ] `PATCH /api/profile/update`
- [ ] `DELETE /api/profile/delete`

#### Agent Logic
- [ ] AMD Developer Cloud API connection
- [ ] Multi-turn conversation context management
- [ ] Complaint type + country detection
- [ ] Clarifying question flow
- [ ] Stage management (understand → draft → escalate)
- [ ] Complaint letter generation prompt
- [ ] Escalation letter generation prompt
- [ ] Regulator detection + contact lookup

#### Integration + Polish
- [ ] PDF generation (jspdf)
- [ ] Full end-to-end integration test
- [ ] HuggingFace Space deployment
- [ ] Vercel deployment

---

### Zabdiel (Fwesh) — Pages + Submission

#### Pages
- [ ] Profile page (`/dashboard/profile`)
- [ ] Settings page (`/dashboard/settings`)
- [ ] Terms of Service page (`/terms`)
- [ ] Privacy Policy page (`/privacy`)

#### Submission Deliverables
- [ ] Record demo video (full user flow screen recording)
- [ ] Edit and export demo video
- [ ] Fill out lablab submission form
- [ ] Complete lablab team progress checklist

---

## 5. Build Timeline

| Day | SAMKIEL | Zabdiel |
|---|---|---|
| Day 1–2 (May 4–5) | Scaffold, auth, models, NextAuth | — |
| Day 3 (May 6) | API routes (auth, complaints, chat) | UI components |
| Day 4 (May 7) | Agent logic + letter generation | Profile + settings pages |
| Day 5 (May 8) | Escalation + PDF + integration | Terms + privacy pages |
| Day 6 (May 9–10) | HF Space + Vercel deploy + polish | Demo video + submission |

---

## 6. Handoff Points

| When | What |
|---|---|
| Day 5 end | Full app working end to end |
| Day 6 morning | Zabdiel records demo on working app |
| Day 6 afternoon | Submit on lablab before deadline |

---

## 7. Deployment

**Primary:** Vercel
- Connect GitHub repo to Vercel
- Add all env variables in Vercel dashboard
- Auto-deploy on push to main

**HuggingFace Space:**
- Publish as HF Space inside lablab AMD hackathon organization
- Share Space link publicly for community likes (HF prize)
- Submit Space link on lablab submission form
- HF Org: https://huggingface.co/organizations/lablab-ai-amd-developer-hackathon

---

## 8. Key Links

| Resource | Link |
|---|---|
| Hackathon page | https://lablab.ai/ai-hackathons/amd-developer |
| Team page | https://lablab.ai/ai-hackathons/amd-developer/team-samkiel |
| GitHub repo | https://github.com/AMDHACKATHON/Redress |
| HF Organization | https://huggingface.co/organizations/lablab-ai-amd-developer-hackathon |
| Workshop livestream | https://www.twitch.tv/videos/2764117667 |
| Prize pool | $10,000 + AMD Radeon AI PRO R9700 GPU |

---

*Redress — AMD Developer Hackathon 2026 | Team SAMKIEL*
