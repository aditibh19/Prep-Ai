
# PrepAI 🚀

A full-stack AI-powered interview preparation platform built with React, Node.js, and MongoDB. PrepAI helps candidates prepare for technical interviews with mock interviews, DSA tracking, resume analysis, company-specific roadmaps, and personalized study plans — all powered by free AI providers (Groq + Gemini).

---

## ✨ Features

- **AI Mock Interviews** — Role-specific mock interviews with real-time AI evaluation, per-answer scoring, and a comprehensive final report
- **Company Roadmaps** — Tailored interview prep roadmaps for top companies (Amazon, Google, Microsoft, Meta, and more)
- **DSA Tracker** — Track your Data Structures & Algorithms practice progress
- **Resume Analyzer** — Upload and analyze your resume with AI-powered feedback
- **Study Plans** — Generate personalized week-by-week placement preparation plans
- **Analytics Dashboard** — Visualize your progress and performance over time
- **Voice Mode** — Speak your answers using the browser's native Web Speech API (Chrome/Edge only)
- **Authentication** — JWT-based auth with protected routes

---
## 📸 Screenshots

### Landing Page

![Landing Page - Hero Section](screenshot/landing1.png)
![Landing Page - Features](screenshot/landing2.png)

### Sign Up

![Sign Up Page](screenshot/Signup.png)

### Login

![Login Page](screenshot/Login.png)

### Dashboard

![User Dashboard](screenshot/dashboard.png)

### AI Mock Interview

![Live AI Mock Interview](screenshot/interview.png)

### Interview Report

![AI Interview Report](screenshot/report.png)

### Resume Analyzer

![Resume Analysis Results](screenshot/resume.png)

### Company Roadmap

![Company Selection](screenshot/roadma1.png)
![Generated Company Roadmap](screenshot/roadmap2.png)

### DSA Tracker

![DSA Progress Tracker](screenshot/dsa.png)

### Study Plan

![Personalized Study Plan](screenshot/studyplan.png)

### Analytics

![Performance Analytics Dashboard](screenshot/analytics.png)

### Profile

![User Profile](screenshot/profile.png)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Routing | Wouter |
| State / Data fetching | TanStack Query v5 |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Express, Node.js 18+ |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI (primary) | Groq — llama-3.3-70b-versatile (free, fast) |
| AI (fallback) | Google Gemini 2.0 Flash (optional) |
| Voice | Web Speech API (browser native, no API key needed) |
| Fonts | Outfit, Space Grotesk, JetBrains Mono (Google Fonts) |

---

## 📁 Project Structure

```
Prepai/
├── backend/
│   ├── lib/
│   │   └── freeAI.js           # AI abstraction: Groq (primary) + Gemini (fallback)
│   ├── middleware/
│   │   └── auth.js             # JWT auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── DsaProblem.js
│   │   ├── InterviewSession.js
│   │   ├── ResumeReport.js
│   │   └── StudyPlan.js
│   ├── routes/
│   │   ├── auth.js             # Register, login, profile
│   │   ├── dsa.js              # DSA CRUD + stats
│   │   ├── interviews.js       # AI mock interview flow
│   │   ├── resume.js           # Resume analysis
│   │   ├── companies.js        # Company list + AI roadmaps
│   │   ├── analytics.js        # Dashboard data
│   │   └── studyPlans.js       # Study plan CRUD
│   ├── env.js                  # Loads dotenv — MUST be first import in server.js
│   ├── server.js               # Express entry point
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── AppLayout.jsx   # Sidebar navigation layout
│       ├── contexts/
│       │   └── AuthContext.jsx # JWT auth state
│       ├── lib/
│       │   └── api.js          # Axios instance with JWT interceptor
│       ├── pages/
│       │   ├── Landing.jsx     # Login + register
│       │   ├── Dashboard.jsx
│       │   ├── DsaTracker.jsx
│       │   ├── ResumeAnalyzer.jsx
│       │   ├── Companies.jsx
│       │   ├── CompanyRoadmap.jsx
│       │   ├── StudyPlans.jsx
│       │   ├── Analytics.jsx
│       │   ├── Profile.jsx
│       │   └── interviews/
│       │       ├── InterviewList.jsx
│       │       ├── InterviewNew.jsx
│       │       ├── InterviewLive.jsx   # Voice + text interview UI
│       │       └── InterviewReport.jsx
│       ├── App.jsx
│       ├── index.css           # Tailwind + Google Fonts + global styles
│       └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
```

> ⚠️ `scripts/src/hello.ts` is an unused scaffold file and can be deleted.

---

## ⚙️ Setup & Installation

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| MongoDB | 7+ local OR free Atlas cloud |
| Git | any |

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/prepai.git
cd prepai
```

### 2. Get a Groq API key (free, required)

1. Go to https://console.groq.com
2. Sign up → API Keys → Create Key
3. Copy the key — it starts with `gsk_`

> Groq is completely free and takes 30 seconds to set up.

### 3. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/prepai
JWT_SECRET=your_long_random_secret_here
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here    # optional fallback
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret for signing JWTs |
| `GROQ_API_KEY` | ✅ Yes | Get free at console.groq.com |
| `GEMINI_API_KEY` | ❌ Optional | Fallback if Groq fails — aistudio.google.com |
| `PORT` | ❌ Optional | Backend port (default: 5000) |
| `CLIENT_URL` | ❌ Optional | Frontend origin for CORS (default: http://localhost:5173) |

> ⚠️ Never commit `.env` to GitHub. It is already in `.gitignore`.

---

## 🌐 API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |

### DSA Tracker
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dsa` | List problems |
| POST | `/api/dsa` | Add problem |
| PATCH | `/api/dsa/:id` | Update problem |
| DELETE | `/api/dsa/:id` | Delete problem |
| GET | `/api/dsa/stats` | Aggregated stats |

### Interviews
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/interviews/start` | Start new session |
| GET | `/api/interviews` | List sessions |
| GET | `/api/interviews/:id` | Get session + messages |
| POST | `/api/interviews/:id/answer` | Submit answer, get AI feedback |
| POST | `/api/interviews/:id/end` | End session, generate report |

### Resume
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/resume/analyze` | Analyze resume text |
| GET | `/api/resume/reports` | List past reports |
| GET | `/api/resume/reports/:id` | Get report detail |

### Companies
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/companies` | List 12 supported companies |
| POST | `/api/companies/:id/roadmap` | Generate AI roadmap |

### Study Plans
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/study-plans` | List all study plans |
| POST | `/api/study-plans` | Create a new plan |
| GET | `/api/study-plans/:id` | Get plan with weekly breakdown |
| DELETE | `/api/study-plans/:id` | Delete a plan |

### System
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Server health check |

---

## 🤖 AI Provider Details

PrepAI uses `backend/lib/freeAI.js` to abstract two free providers:

```
Groq (primary) → Gemini (fallback if Groq fails or rate-limits)
```

The server will refuse to start if `GROQ_API_KEY` is missing. `GEMINI_API_KEY` is optional.

---

## 🎙️ Voice Mode

Uses the browser's native Web Speech API — no extra library or API key needed.

- **Speech Recognition** — captures spoken answers, auto-submits after silence
- **Speech Synthesis** — reads AI questions aloud
- **Best support:** Chrome (desktop) or Edge. Firefox is not supported.

---

