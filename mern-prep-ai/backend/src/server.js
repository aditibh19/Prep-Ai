import "./env.js"; // ← MUST be first — loads .env before any other module initializes

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// ─── Validate required env vars ──────────────────────────────────────────────
const REQUIRED = ["JWT_SECRET", "GROQ_API_KEY", "MONGO_URI"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  console.error("   Copy backend/.env.example to backend/.env and fill in the values.");
  process.exit(1);
}

import authRoutes      from "./routes/auth.js";
import dsaRoutes       from "./routes/dsa.js";
import interviewRoutes from "./routes/interviews.js";
import resumeRoutes    from "./routes/resume.js";
import companiesRoutes from "./routes/companies.js";
import analyticsRoutes from "./routes/analytics.js";
import studyPlanRoutes from "./routes/studyPlans.js";

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/dsa",         dsaRoutes);
app.use("/api/interviews",  interviewRoutes);
app.use("/api/resume",      resumeRoutes);
app.use("/api/companies",   companiesRoutes);
app.use("/api/analytics",   analyticsRoutes);
app.use("/api/study-plans", studyPlanRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[server error]", err.stack ?? err.message);
  const status = err.status || err.statusCode || 500;
  const safe   = status < 500 ? err.message : "An unexpected error occurred";
  res.status(status).json({ error: safe });
});

// ─── DB + Start ──────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/prepai")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });