# PrepAI – AI Placement Mentor

An AI-powered placement preparation platform helping students prepare for technical interviews through personalized mentoring, mock interviews, resume analysis, DSA tracking, and company-specific roadmaps.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/prep-ai run dev` — run the frontend (port varies, via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — typecheck composite libs only
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS + Recharts + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Replit Auth (OpenID Connect + PKCE) — session-based via `@workspace/replit-auth-web`
- AI: Google Gemini (`@google/genai`) via user's GEMINI_API_KEY
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/auth.ts` — users + sessions tables
- `lib/db/src/schema/prepai.ts` — DSA problems, interviews, resume reports, companies, study plans, profiles
- `lib/replit-auth-web/` — browser auth hook (`useAuth()`) for the frontend
- `artifacts/api-server/src/routes/` — all API routes (auth, dashboard, dsa, resume, interviews, companies, study-plans, analytics, profile)
- `artifacts/api-server/src/lib/gemini.ts` — Gemini AI helper (generateText, generateJson)
- `artifacts/prep-ai/src/` — React frontend

## Architecture decisions

- OpenAPI-first: All types flow from `lib/api-spec/openapi.yaml` → codegen → frontend hooks + server Zod schemas
- Replit Auth for authentication — no custom login forms, uses OIDC PKCE flow
- Gemini AI powers: resume analysis, mock interview cross-questioning + scoring, company roadmaps, study plan generation
- Session-based auth (cookie) for web, Bearer token for mobile
- Companies seeded at DB level; user-specific data (DSA, interviews, plans) are per-user

## Product

- **Dashboard**: personalized progress overview with DSA stats, interview scores, recent activity, weak topics
- **DSA Tracker**: add/filter/edit problems by topic/difficulty/status; analytics with charts
- **AI Mock Interviews**: adaptive interviews with AI cross-questioning, per-answer scoring, full report generation
- **Resume Analyzer**: paste resume text → Gemini generates ATS score, missing skills, improvements, sample questions
- **Company Prep**: 12 companies seeded; AI generates roadmap, frequent topics, questions per company
- **Study Planner**: AI generates week-by-week study plan based on target company + days left
- **Analytics**: interview score trends, DSA progress charts, topic strength, weekly hours
- **Profile**: editable skills, projects, target company/role; auto-calculated preparation progress

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After OpenAPI spec changes, always run codegen: `pnpm --filter @workspace/api-spec run codegen`
- `createInsertSchema` from drizzle-zod already excludes `generatedAlwaysAsIdentity()` columns — do NOT call `.omit({ id: true })` on top
- `replit-auth-web` needs `vite` as devDependency and `"types": ["vite/client"]` in tsconfig for `import.meta.env`
- Gemini client uses `GEMINI_API_KEY` secret — if missing, AI features fail gracefully with 500 errors
- API server must rebuild (`pnpm run build`) before restart since it's compiled with esbuild

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `replit-auth` skill for auth flow details
