# PrepAI – AI Placement Mentor (MERN Stack)

A full-stack AI-powered placement preparation platform built with **MongoDB · Express · React · Node.js**.

### Features
- 🎙️ **AI Mock Interviews** — voice or text mode, real-time cross-questioning, per-answer scoring, full AI report
- 📊 **DSA Tracker** — log problems by topic, difficulty, platform; one-click status toggle
- 📄 **Resume Analyzer** — ATS score, section scores, missing keywords via Gemini AI
- 🏢 **Company Roadmaps** — AI-generated 8-week prep plans for Amazon, Google, Microsoft, and 9 more
- 📈 **Analytics** — score trends, DSA progress charts (Recharts)
- 📚 **Study Plans** — AI-generated week-by-week plans for any role/company

---

## Prerequisites

Install these before anything else:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 18+ | https://nodejs.org |
| **MongoDB** | 7+ (local) OR use Atlas (free cloud) | https://www.mongodb.com/try/download/community |
| **Git** | any | https://git-scm.com |
| **VS Code** | any | https://code.visualstudio.com |

### Recommended VS Code Extensions
Open VS Code → `Ctrl+Shift+X` → search and install:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Thunder Client** (`rangav.vscode-thunder-client`) — for testing API routes
- **MongoDB for VS Code** (`mongodb.mongodb-vscode`) — view your DB visually
- **GitLens** (`eamodio.gitlens`)

---

## Part 1 — Get the Code from GitHub

### Option A: You are cloning someone else's repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/mern-prep-ai
```

### Option B: Push THIS code to your GitHub (new repo)

**Step 1 — Create a GitHub repo**
1. Go to https://github.com/new
2. Name it `prepai` (or anything)
3. Keep it **Public** or **Private**
4. ❌ Do NOT add README/gitignore (we have them already)
5. Click **Create repository**

**Step 2 — Push from your machine**

If you're pushing from Replit, download the `mern-prep-ai/` folder as a zip first (three-dot menu → Download as zip), then:

```bash
# Navigate into the mern-prep-ai folder
cd mern-prep-ai

# Initialize git if not already done
git init
git add .
git commit -m "Initial PrepAI MERN commit"

# Connect to your GitHub repo (replace with YOUR URL)
git remote add origin https://github.com/YOUR_USERNAME/prepai.git
git branch -M main
git push -u origin main
```

---

## Part 2 — Run Locally in VS Code

### Step 1 — Open in VS Code

```bash
# Clone your GitHub repo (if not already on your machine)
git clone https://github.com/YOUR_USERNAME/prepai.git
cd prepai/mern-prep-ai

# Open in VS Code
code .
```

Or: Open VS Code → `File → Open Folder` → select the `mern-prep-ai` folder.

---

### Step 2 — Set Up MongoDB

#### Option A — Local MongoDB (Recommended for development)

1. Download and install from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - **Windows**: MongoDB runs automatically as a service after install. Or: `net start MongoDB`
   - **macOS**: `brew services start mongodb-community` (if installed via Homebrew)
   - **Linux**: `sudo systemctl start mongod`
3. Verify it's running: open a terminal and type `mongosh` — you should see a prompt.

Your connection string will be: `mongodb://localhost:27017/prepai`

#### Option B — MongoDB Atlas (Free cloud, no install needed)

1. Go to https://cloud.mongodb.com → Sign up free
2. Create a **Free Tier** cluster (M0)
3. Click **Connect → Connect your application**
4. Copy the connection string, e.g.:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/prepai?retryWrites=true&w=majority
   ```

---

### Step 3 — Get Your Gemini API Key

1. Go to https://aistudio.google.com
2. Sign in with your Google account
3. Click **Get API Key → Create API key**
4. Copy the key (looks like `AIzaSy...`)

---

### Step 4 — Configure Environment Variables

**Backend `.env`**

In VS Code, open the `backend/` folder, create a file called `.env`:

```bash
# In terminal from the mern-prep-ai directory:
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/prepai
JWT_SECRET=any_long_random_string_change_this_in_production
GEMINI_API_KEY=AIzaSyYour_actual_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`**

```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env` content (usually no changes needed for local dev):

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **IMPORTANT**: Never commit `.env` files to GitHub. The `.gitignore` already excludes them.

---

### Step 5 — Install Dependencies

Open VS Code's integrated terminal (`Ctrl+\`` or `Terminal → New Terminal`):

```bash
# Make sure you're in the mern-prep-ai folder
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Or from the root `mern-prep-ai/` folder, run both at once:
```bash
npm run install:all
```

---

### Step 6 — Run the App

You need **two terminal windows** running simultaneously.

**Terminal 1 — Backend**
```bash
# From mern-prep-ai/
cd backend
npm run dev
```
You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
# From mern-prep-ai/
cd frontend
npm run dev
```
You should see:
```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

**Open the app**: http://localhost:5173

---

## Project Structure

```
mern-prep-ai/
│
├── backend/                    # Express + Node.js API
│   ├── src/
│   │   ├── server.js           # Entry point, Express setup
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification middleware
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── DsaProblem.js
│   │   │   ├── InterviewSession.js
│   │   │   ├── ResumeReport.js
│   │   │   └── StudyPlan.js
│   │   ├── routes/             # Express routers
│   │   │   ├── auth.js         # Register, login, profile
│   │   │   ├── dsa.js          # DSA CRUD + stats
│   │   │   ├── interviews.js   # AI mock interview flow
│   │   │   ├── resume.js       # Resume analysis
│   │   │   ├── companies.js    # Company list + roadmaps
│   │   │   ├── analytics.js    # Dashboard data
│   │   │   └── studyPlans.js   # Study plan CRUD
│   │   └── lib/
│   │       └── gemini.js       # Google Gemini AI helpers
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Router + protected routes
│   │   ├── index.css           # Tailwind + global styles
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # JWT auth state (login/register/logout)
│   │   ├── lib/
│   │   │   └── api.js          # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   └── AppLayout.jsx   # Sidebar navigation
│   │   └── pages/
│   │       ├── Landing.jsx     # Auth page (login + register)
│   │       ├── Dashboard.jsx
│   │       ├── DsaTracker.jsx
│   │       ├── ResumeAnalyzer.jsx
│   │       ├── Companies.jsx
│   │       ├── CompanyRoadmap.jsx
│   │       ├── StudyPlans.jsx
│   │       ├── Analytics.jsx
│   │       ├── Profile.jsx
│   │       └── interviews/
│   │           ├── InterviewList.jsx
│   │           ├── InterviewNew.jsx
│   │           ├── InterviewLive.jsx   # ← Voice interview UI
│   │           └── InterviewReport.jsx
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
├── package.json                # Root scripts (install:all, dev)
└── README.md
```

---

## API Routes Reference

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
| GET | `/api/dsa` | List problems (filter by topic/difficulty/status) |
| POST | `/api/dsa` | Add problem |
| PATCH | `/api/dsa/:id` | Update problem |
| DELETE | `/api/dsa/:id` | Delete problem |
| GET | `/api/dsa/stats` | Aggregated stats |

### Interviews (AI Mock)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/interviews/start` | Start new session (Gemini generates Q1) |
| GET | `/api/interviews` | List sessions |
| GET | `/api/interviews/:id` | Get session + messages |
| POST | `/api/interviews/:id/answer` | Submit answer (AI cross-questions + scores) |
| POST | `/api/interviews/:id/end` | End session (AI generates full report) |

### Resume
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/resume/analyze` | Analyze resume text (Gemini) |
| GET | `/api/resume/reports` | List past reports |
| GET | `/api/resume/reports/:id` | Get report detail |

### Companies
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/companies` | List 12 companies |
| POST | `/api/companies/:id/roadmap` | Generate AI roadmap |

---

## Voice Interview — How It Works

The voice feature uses the **browser's native Web Speech API** — no extra library or API key needed.

1. **Microphone (Speech Recognition)** — Captures your spoken answer, converts to text, auto-submits after you stop speaking.
2. **Text-to-Speech (Speech Synthesis)** — The AI interviewer's questions are read aloud automatically.
3. **Visual feedback** — Animated waveform bars show when the mic is active; a speaker icon shows when the AI is speaking.

> **Best browser support**: Chrome (desktop) or Edge. Safari has partial support. Firefox does not support `SpeechRecognition`.

To use voice mode during an interview:
1. Start any interview
2. Click the **"Text Mode"** button in the header to toggle to **"Voice On"**
3. Tap the large mic button → speak your answer → it auto-submits
4. Toggle the speaker icon 🔊 to mute/unmute AI voice

---

## Common Issues & Fixes

### ❌ `MongoServerError: connect ECONNREFUSED`
MongoDB is not running. Start it:
- Windows: `net start MongoDB`
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### ❌ `Error: GEMINI_API_KEY not set` or AI routes return 500
Check `backend/.env` exists and has a valid `GEMINI_API_KEY`.

### ❌ `CORS error` in browser console
Check that `CLIENT_URL` in `backend/.env` matches your frontend URL exactly (e.g., `http://localhost:5173`).

### ❌ Frontend shows blank / can't reach API
- Confirm the backend is running on port 5000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`
- The Vite proxy in `vite.config.js` handles `/api` calls automatically in dev

### ❌ Voice mode not working
- Use **Chrome** or **Edge** (not Firefox or Safari)
- When prompted, **allow microphone access** in the browser
- Make sure you're on `http://localhost` (not a non-secure origin)

---

## Deploy to Production

### Deploy Backend (Render.com — free tier)
1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo, set root directory to `mern-prep-ai/backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render's dashboard (same as your `.env`)

### Deploy Frontend (Vercel — free tier)
1. Go to https://vercel.com → New Project → Import GitHub repo
2. Set root directory to `mern-prep-ai/frontend`
3. Framework preset: **Vite**
4. Add environment variable: `VITE_API_URL=https://your-render-backend-url.onrender.com/api`
5. Deploy

### Use MongoDB Atlas for Production
Use your Atlas connection string as `MONGO_URI` in Render environment variables.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Routing | Wouter |
| State | React Query (TanStack Query v5) |
| HTTP client | Axios |
| Charts | Recharts |
| Backend | Express 5, Node.js 18+ |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | Google Gemini 2.0 Flash (`@google/genai`) |
| Voice | Web Speech API (browser native) |
| Fonts | Space Grotesk, JetBrains Mono |
