import "./env.js";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import dsaRoutes from "./routes/dsa.js";
import interviewRoutes from "./routes/interviews.js";
import resumeRoutes from "./routes/resume.js";
import companiesRoutes from "./routes/companies.js";
import analyticsRoutes from "./routes/analytics.js";
import studyPlanRoutes from "./routes/studyPlans.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "https://prep-ai-frontend-eosin.vercel.app",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES (IMPORTANT FIX HERE) ─────────────
app.use("/auth", authRoutes);               // ✅ FIXED
app.use("/api/dsa", dsaRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/study-plans", studyPlanRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok" })
);

// ─── Error handler ───────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// ─── DB CONNECT + START ──────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });