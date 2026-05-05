# Redress — Task Allocation

**Project:** Redress  
**Hackathon:** AMD Developer Hackathon 2026  
**Team:** SAMKIEL | Fwesh | KingdomDev  
**Build Window:** May 4–10, 2026  

---

## SAMKIEL — Frontend Core + Integration

Owner of the core app flow, API integration, and overall product experience.

### App Infrastructure
- [ ] Clean the Next.js scaffold
- [ ] Set up folder structure
- [ ] `lib/api.ts` — Axios instance with base URL and JWT token interceptor
- [ ] `lib/store.ts` — Zustand store (user state, active complaint)
- [ ] `types/index.ts` — All TypeScript interfaces (User, Complaint, Message, Letter, etc.)

### Pages
- [ ] `(auth)/login/page.tsx` — Login page
- [ ] `(auth)/register/page.tsx` — Register page
- [ ] `(dashboard)/layout.tsx` — Protected route wrapper
- [ ] `(dashboard)/page.tsx` — Complaint history page
- [ ] `(dashboard)/complaint/[id]/page.tsx` — Single complaint chat interface + letter display

### API Proxy Routes
- [ ] `app/api/auth/` — Auth proxy routes to Django
- [ ] `app/api/complaints/` — Complaints proxy routes
- [ ] `app/api/letters/` — Letter proxy routes

### Integration
- [ ] Connect auth pages to Emmanuel's `/auth/login` and `/auth/register` endpoints
- [ ] Connect complaint history to `GET /complaints/`
- [ ] Connect chat interface to `POST /complaints/{id}/message`
- [ ] Connect letter display to `GET /complaints/{id}/letter`
- [ ] Connect escalation to `POST /complaints/{id}/letter/escalate`
- [ ] PDF generation client-side from letter string (jspdf)

---

## Zabdiel (Fwesh) — Components + Landing + Pitch

Owner of reusable UI components, the landing page, and all submission deliverables.

### UI Components (`components/ui/`)
- [ ] `Button.tsx` — Primary, secondary, destructive variants
- [ ] `Input.tsx` — Text input with label and error state
- [ ] `Card.tsx` — General purpose card wrapper
- [ ] `Avatar.tsx` — User avatar with fallback initials
- [ ] `Badge.tsx` — Stage badge (understand / draft / escalate)

### Chat Components (`components/chat/`)
- [ ] `MessageBubble.tsx` — User and agent message bubbles

### Letter Components (`components/letter/`)
- [ ] `LetterDisplay.tsx` — Formatted letter display card
- [ ] `PDFDownloadButton.tsx` — Triggers client-side PDF download

### Pages
- [ ] `app/page.tsx` — Landing page (hero, how it works, CTA to register)
- [ ] `(dashboard)/profile/page.tsx` — Profile page (view + edit name, avatar, country)

### Submission Deliverables
- [ ] Record the demo video (screen recording of full user flow)
- [ ] Edit and export the demo video
- [ ] Prepare the project presentation slides
- [ ] Fill out the lablab submission form
- [ ] Complete the lablab team progress checklist

---

## Emmanuel (KingdomDev) — Backend + Agent

Owner of the entire Django backend, agent logic, and AMD LLM integration.

### Setup
- [ ] Django project scaffold with Django REST Framework
- [ ] `djangorestframework-simplejwt` for auth
- [ ] Token blacklist for logout
- [ ] Database models (User, Profile, Complaint, Message, Letter, EscalationLetter)
- [ ] CORS configured for Next.js frontend origin

### Auth Endpoints
- [ ] `POST /auth/register`
- [ ] `POST /auth/login`
- [ ] `POST /auth/logout`
- [ ] `POST /auth/token/refresh`
- [ ] `GET /auth/me`

### Profile Endpoints
- [ ] `GET /profile/`
- [ ] `PATCH /profile/update`
- [ ] `DELETE /profile/delete`

### Complaint Endpoints
- [ ] `POST /complaints/start`
- [ ] `GET /complaints/`
- [ ] `GET /complaints/{id}`
- [ ] `DELETE /complaints/{id}` (cascade delete messages + letters)

### Chat Endpoints
- [ ] `POST /complaints/{id}/message` (agent reply + stage management)
- [ ] `GET /complaints/{id}/messages`

### Letter Endpoints
- [ ] `POST /complaints/{id}/letter/generate`
- [ ] `GET /complaints/{id}/letter`
- [ ] `POST /complaints/{id}/letter/escalate`
- [ ] `GET /complaints/{id}/letter/escalation`

### Agent Logic
- [ ] AMD Developer Cloud API integration
- [ ] Multi-turn conversation context management
- [ ] Complaint type and country detection
- [ ] Clarifying question flow
- [ ] `ready_for_letter` and `stage` field logic
- [ ] Formal letter generation prompt
- [ ] Escalation letter generation prompt
- [ ] Tavily web search integration for live regulator lookup

---

## Handoff Points

These are the integration moments where SAMKIEL and Emmanuel must sync:

| When | What |
|---|---|
| Day 2 end | Emmanuel confirms `/auth/login` and `/auth/register` are up so SAMKIEL can connect auth pages |
| Day 3 end | Emmanuel confirms `/complaints/start` and `/complaints/{id}/message` are up so SAMKIEL can build the chat interface |
| Day 4 end | Emmanuel confirms `/letter/generate` and `/letter/escalate` are up so SAMKIEL can wire letter display and PDF |
| Day 5 | Full integration test across all endpoints |
| Day 6 | Zabdiel records demo video, SAMKIEL reviews submission, all submit |

---

## Build Timeline

| Day | SAMKIEL | Zabdiel | Emmanuel |
|---|---|---|---|
| Day 1 (May 4) | Scaffold, folder structure, api.ts, store, types | — | Django setup, models, auth endpoints |
| Day 2 (May 5) | Login + register pages | UI components (Button, Input, Card) | Complaint + message endpoints |
| Day 3 (May 6) | Dashboard + complaint history page | Avatar, Badge, MessageBubble | Agent logic + AMD integration |
| Day 4 (May 7) | Chat interface + letter display | Landing page + profile page | Letter + escalation endpoints |
| Day 5 (May 8) | Full integration + PDF + polish | PDF button + final component polish | Bug fixes + search tool integration |
| Day 6 (May 9–10) | Final testing + review submission | Demo video + slides + lablab submission | Final backend testing |

---

*Redress — AMD Developer Hackathon 2026 | Team SAMKIEL*
