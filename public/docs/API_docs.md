# Redress API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.redress.app`  
**Backend:** Python, Django REST Framework  
**Auth:** JWT via `djangorestframework-simplejwt`  
**Team:** SAMKIEL | AMD Developer Hackathon 2026  

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Auth Endpoints](#auth-endpoints)
4. [Profile Endpoints](#profile-endpoints)
5. [Complaint Endpoints](#complaint-endpoints)
6. [Chat Endpoints](#chat-endpoints)
7. [Letter Endpoints](#letter-endpoints)
8. [Error Handling](#error-handling)
9. [Agent Stage Flow](#agent-stage-flow)
10. [Notes for Emmanuel](#notes-for-emmanuel)
11. [Notes for SAMKIEL](#notes-for-samkiel)

---

## Overview

The Redress API is the backend layer of the Redress complaint resolution platform. It is built with Django REST Framework and consumed by the Next.js frontend. All communication is via JSON over HTTPS. Authentication uses JWT tokens issued on login and refreshed as needed.

A user creates a complaint session, has a back-and-forth conversation with the AI agent within that complaint, and at the right stage the agent generates a formal complaint letter and optionally an escalation letter. Both letters are saved in the backend and fetched by the frontend on demand.

---

## Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/auth/token/refresh` require a valid JWT access token in the request header.

```
Authorization: Bearer <access_token>
```

Tokens expire after 60 minutes. Use `/auth/token/refresh` with the refresh token to get a new access token.

---

## Auth Endpoints

### Register

Creates a new user account.

```
POST /auth/register
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | Minimum 8 characters |
| `name` | string | Yes | User's display name |

**Request Example**

```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe"
}
```

**Response — 201 Created**

```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "country": null,
    "complaint_count": 0,
    "created_at": "2026-05-05T12:00:00Z"
  },
  "tokens": {
    "access": "<access_token>",
    "refresh": "<refresh_token>"
  }
}
```

---

### Login

Authenticates an existing user and returns JWT tokens.

```
POST /auth/login
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | Account password |

**Request Example**

```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response — 200 OK**

```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "country": "Nigeria",
    "complaint_count": 3,
    "created_at": "2026-05-05T12:00:00Z"
  },
  "tokens": {
    "access": "<access_token>",
    "refresh": "<refresh_token>"
  }
}
```

---

### Logout

Blacklists the refresh token, invalidating the session.

```
POST /auth/logout
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `refresh` | string | Yes | The refresh token to blacklist |

**Request Example**

```json
{
  "refresh": "<refresh_token>"
}
```

**Response — 200 OK**

```json
{
  "message": "Logged out successfully."
}
```

---

### Refresh Token

Returns a new access token using a valid refresh token.

```
POST /auth/token/refresh
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `refresh` | string | Yes | A valid refresh token |

**Request Example**

```json
{
  "refresh": "<refresh_token>"
}
```

**Response — 200 OK**

```json
{
  "access": "<new_access_token>"
}
```

---

### Get Current User

Returns the authenticated user's data including profile. No request body needed.

```
GET /auth/me
```

**Response — 200 OK**

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://cdn.redress.app/avatars/usr_abc123.jpg",
  "country": "Nigeria",
  "complaint_count": 3,
  "created_at": "2026-05-05T12:00:00Z"
}
```

---

## Profile Endpoints

### Get Profile

Returns the authenticated user's profile.

```
GET /profile/
```

**Response — 200 OK**

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://cdn.redress.app/avatars/usr_abc123.jpg",
  "country": "Nigeria",
  "complaint_count": 3,
  "created_at": "2026-05-05T12:00:00Z"
}
```

---

### Update Profile

Updates one or more profile fields. All fields are optional.

```
PATCH /profile/update
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | Updated display name |
| `avatar` | string | No | URL or base64 image string |
| `country` | string | No | User's country |

**Request Example**

```json
{
  "name": "John D.",
  "country": "Ghana"
}
```

**Response — 200 OK**

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John D.",
  "avatar": "https://cdn.redress.app/avatars/usr_abc123.jpg",
  "country": "Ghana",
  "complaint_count": 3,
  "created_at": "2026-05-05T12:00:00Z"
}
```

---

### Delete Account

Permanently deletes the user account and all associated data including complaints, messages, and letters.

```
DELETE /profile/delete
```

**Response — 200 OK**

```json
{
  "message": "Account deleted successfully."
}
```

---

## Complaint Endpoints

A complaint is a case. Each complaint has its own message thread, generated letter, and optional escalation letter.

### Start a Complaint

Creates a new complaint session.

```
POST /complaints/start
```

**Response — 201 Created**

```json
{
  "complaint_id": "cmp_xyz789",
  "stage": "understand",
  "created_at": "2026-05-05T12:00:00Z"
}
```

---

### List All Complaints

Returns all complaints belonging to the authenticated user, ordered by most recent.

```
GET /complaints/
```

**Response — 200 OK**

```json
{
  "complaints": [
    {
      "complaint_id": "cmp_xyz789",
      "summary": "Account frozen by First Bank Nigeria for 3 weeks without explanation.",
      "stage": "escalate",
      "letter_generated": true,
      "escalation_generated": true,
      "created_at": "2026-05-05T12:00:00Z"
    },
    {
      "complaint_id": "cmp_def456",
      "summary": "MTN overcharged data plan for two billing cycles.",
      "stage": "draft",
      "letter_generated": true,
      "escalation_generated": false,
      "created_at": "2026-05-04T09:30:00Z"
    }
  ]
}
```

---

### Get Single Complaint

Returns a single complaint with its full message thread.

```
GET /complaints/{complaint_id}
```

**Response — 200 OK**

```json
{
  "complaint_id": "cmp_xyz789",
  "summary": "Account frozen by First Bank Nigeria for 3 weeks without explanation.",
  "stage": "escalate",
  "letter_generated": true,
  "escalation_generated": true,
  "created_at": "2026-05-05T12:00:00Z",
  "messages": [
    {
      "message_id": "msg_001",
      "role": "user",
      "content": "My bank froze my account for 3 weeks with no explanation.",
      "created_at": "2026-05-05T12:01:00Z"
    },
    {
      "message_id": "msg_002",
      "role": "agent",
      "content": "I'm sorry to hear that. Can you tell me the name of the bank and the date your account was frozen?",
      "created_at": "2026-05-05T12:01:05Z"
    }
  ]
}
```

---

### Delete Complaint

Permanently deletes a complaint and all associated messages and letters.

```
DELETE /complaints/{complaint_id}
```

**Response — 200 OK**

```json
{
  "message": "Complaint and all associated data deleted successfully."
}
```

---

## Chat Endpoints

### Send a Message

Sends a user message within a complaint session and returns the agent's reply. The agent progresses through three stages: `understand`, `draft`, and `escalate`.

```
POST /complaints/{complaint_id}/message
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | The user's message text |

**Request Example**

```json
{
  "content": "My bank froze my account for 3 weeks with no explanation."
}
```

**Response — 200 OK**

| Field | Type | Description |
|---|---|---|
| `message_id` | string | ID of the agent's reply message |
| `reply` | string | The agent's response text |
| `stage` | string | Current stage: `understand`, `draft`, or `escalate` |
| `ready_for_letter` | boolean | `true` when the agent has enough info to generate a letter |
| `clarifying_questions_done` | boolean | `true` when the agent has finished clarifying questions |

**Response Example**

```json
{
  "message_id": "msg_002",
  "reply": "I'm sorry to hear that. Can you tell me the name of the bank and the date your account was frozen?",
  "stage": "understand",
  "ready_for_letter": false,
  "clarifying_questions_done": false
}
```

> **Frontend note:** Watch `ready_for_letter`. When it flips to `true`, show the Generate Letter button. When `stage` becomes `escalate`, show the Escalate button.

---

### Get Message History

Returns the full message thread for a complaint.

```
GET /complaints/{complaint_id}/messages
```

**Response — 200 OK**

```json
{
  "complaint_id": "cmp_xyz789",
  "messages": [
    {
      "message_id": "msg_001",
      "role": "user",
      "content": "My bank froze my account for 3 weeks with no explanation.",
      "created_at": "2026-05-05T12:01:00Z"
    },
    {
      "message_id": "msg_002",
      "role": "agent",
      "content": "I'm sorry to hear that. Can you tell me the name of the bank and the date your account was frozen?",
      "created_at": "2026-05-05T12:01:05Z"
    }
  ]
}
```

---

## Letter Endpoints

### Generate Letter

Triggers letter generation by the agent. The letter is saved to the database. Only callable when `ready_for_letter` is `true`.

```
POST /complaints/{complaint_id}/letter/generate
```

**Response — 201 Created**

```json
{
  "letter_id": "ltr_001",
  "letter": "Dear Customer Service Manager,\n\nI am writing to formally complain about the unexplained freezing of my account...",
  "recipient": "Customer Service Manager, First Bank Nigeria",
  "channel": "email",
  "regulator": {
    "name": "Central Bank of Nigeria",
    "contact": "consumer@cbn.gov.ng",
    "country": "Nigeria"
  },
  "created_at": "2026-05-05T12:10:00Z"
}
```

---

### Get Letter

Fetches a previously generated complaint letter for a complaint.

```
GET /complaints/{complaint_id}/letter
```

**Response — 200 OK**

```json
{
  "letter_id": "ltr_001",
  "letter": "Dear Customer Service Manager,\n\nI am writing to formally complain about the unexplained freezing of my account...",
  "recipient": "Customer Service Manager, First Bank Nigeria",
  "channel": "email",
  "regulator": {
    "name": "Central Bank of Nigeria",
    "contact": "consumer@cbn.gov.ng",
    "country": "Nigeria"
  },
  "created_at": "2026-05-05T12:10:00Z"
}
```

---

### Generate Escalation Letter

Generates an escalation letter addressed to the regulatory body. Only callable after a complaint letter has been generated for this complaint.

```
POST /complaints/{complaint_id}/letter/escalate
```

**Response — 201 Created**

```json
{
  "escalation_id": "esc_001",
  "escalation_letter": "Dear Director of Consumer Protection,\n\nI previously submitted a formal complaint to First Bank Nigeria on 12 April 2026 and have received no response...",
  "regulator": {
    "name": "Central Bank of Nigeria",
    "contact": "consumer@cbn.gov.ng",
    "filing_instructions": "Send your complaint via email to consumer@cbn.gov.ng with subject line 'Consumer Complaint - [Your Bank Name]'. Attach your original complaint letter and any correspondence received."
  },
  "created_at": "2026-05-05T13:00:00Z"
}
```

---

### Get Escalation Letter

Fetches a previously generated escalation letter for a complaint.

```
GET /complaints/{complaint_id}/letter/escalation
```

**Response — 200 OK**

```json
{
  "escalation_id": "esc_001",
  "escalation_letter": "Dear Director of Consumer Protection,\n\nI previously submitted a formal complaint to First Bank Nigeria on 12 April 2026 and have received no response...",
  "regulator": {
    "name": "Central Bank of Nigeria",
    "contact": "consumer@cbn.gov.ng",
    "filing_instructions": "Send your complaint via email to consumer@cbn.gov.ng with subject line 'Consumer Complaint - [Your Bank Name]'. Attach your original complaint letter and any correspondence received."
  },
  "created_at": "2026-05-05T13:00:00Z"
}
```

---

## Error Handling

All errors return a consistent object.

```json
{
  "error": "Human-readable error message.",
  "code": 400
}
```

**Common Error Codes**

| Code | Meaning |
|---|---|
| `400` | Bad request — missing or invalid fields |
| `401` | Unauthorized — missing or expired token |
| `403` | Forbidden — resource belongs to another user |
| `404` | Not found — complaint, message, or letter does not exist |
| `409` | Conflict — e.g. escalation called before letter was generated |
| `500` | Internal server error — agent or model failure |

**Error Examples**

```json
{
  "error": "Escalation is not available until a complaint letter has been generated.",
  "code": 409
}
```

```json
{
  "error": "Complaint not found.",
  "code": 404
}
```

---

## Agent Stage Flow

```
User starts complaint
        │
        ▼
  [understand] ◄──── Agent asks clarifying questions
        │
        │ ready_for_letter = true
        ▼
    [draft] ──────── Letter generated and saved
        │
        │ User says complaint was ignored
        ▼
  [escalate] ──────── Escalation letter generated and saved
```

---

## Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/token/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user + profile |
| GET | `/profile/` | Get profile |
| PATCH | `/profile/update` | Update profile |
| DELETE | `/profile/delete` | Delete account |
| POST | `/complaints/start` | Start new complaint |
| GET | `/complaints/` | List all complaints |
| GET | `/complaints/{id}` | Get complaint + messages |
| DELETE | `/complaints/{id}` | Delete complaint + letters |
| POST | `/complaints/{id}/message` | Send message, get agent reply |
| GET | `/complaints/{id}/messages` | Get full message history |
| POST | `/complaints/{id}/letter/generate` | Generate complaint letter |
| GET | `/complaints/{id}/letter` | Get saved complaint letter |
| POST | `/complaints/{id}/letter/escalate` | Generate escalation letter |
| GET | `/complaints/{id}/letter/escalation` | Get saved escalation letter |

**Total: 18 endpoints**

---

## Notes for Emmanuel

- Use Django REST Framework + `djangorestframework-simplejwt` for auth. Register, login, and token refresh should take under 2 hours with DRF.
- Use `djangorestframework-simplejwt`'s token blacklist for logout.
- Store the full message history per complaint in the database. The agent needs the entire thread as context on every `/message` call.
- The `stage` field must be determined by the agent logic, not hardcoded. Use the AMD LLM to decide when enough info has been gathered.
- Use Tavily or a web search tool to fetch regulator contact details live inside `/letter/generate` and `/letter/escalate`. Do not hardcode regulator data.
- The `complaint_count` field on the user profile should auto-increment when a new complaint is started.
- Ping SAMKIEL once `/auth/login`, `/complaints/start`, and `/complaints/{id}/message` are up. Those three unlock frontend integration.

---

## Notes for SAMKIEL

- Store the JWT access token in an httpOnly cookie, not localStorage.
- Use the `stage` field from `/message` responses to conditionally render the Generate Letter and Escalate buttons.
- Call `/auth/me` on app load to rehydrate user state.
- The complaint history page calls `GET /complaints/` on load.
- PDF generation happens client-side from the `letter` string returned by the letter endpoints. Use `react-pdf` or `jspdf`.
- All API calls from Next.js should go through internal API routes (`/app/api/...`), not directly from the browser to Django.

---

*Redress — AMD Developer Hackathon 2026 | Team SAMKIEL*
