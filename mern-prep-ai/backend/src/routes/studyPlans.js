import express from "express";
import authMiddleware from "../middleware/auth.js";
import StudyPlan from "../models/StudyPlan.js";
import { generateJSON } from "../lib/freeAI.js";

const router = express.Router();
router.use(authMiddleware);

// GET /api/study-plans
router.get("/", async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-weeks");
    res.json({ plans });
  } catch (err) {
    console.error("[GET /api/study-plans]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/study-plans
router.post("/", async (req, res) => {
  try {
    const { title, targetRole, targetCompany, durationWeeks = 8 } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const role = targetRole || "Software Engineer";
    const companyClause = targetCompany ? ` at ${targetCompany}` : "";
    const weeks = parseInt(durationWeeks, 10) || 8;

    const prompt = `Create a ${weeks}-week placement preparation plan for a ${role} role${companyClause}.

Return a JSON object with a single key "weeks" containing an array of exactly ${weeks} week objects.
Each week object must have these exact keys:
- "week": number (1 to ${weeks})
- "theme": string (the focus theme for the week)
- "goals": array of 2-3 short goal strings
- "tasks": array of 4 specific daily task strings
- "resources": array of 2 resource strings (book, site, or course names)

The JSON must start with { "weeks": [ and nothing else.

Example of the exact format required:
{
  "weeks": [
    {
      "week": 1,
      "theme": "Foundations of DSA",
      "goals": ["Understand arrays and strings", "Solve 10 easy problems"],
      "tasks": ["Study arrays for 1 hour", "Solve 2 LeetCode easy problems", "Review time complexity", "Watch 1 DSA video"],
      "resources": ["LeetCode", "Cracking the Coding Interview"]
    }
  ]
}`;

    console.log(`[POST /api/study-plans] Generating ${weeks}-week plan: "${title}"`);

    let weekPlan;
    try {
      weekPlan = await generateJSON(prompt, { maxTokens: 4096 });
    } catch (aiErr) {
      console.error("[POST /api/study-plans] AI generation failed:", aiErr.message);
      return res.status(502).json({
        error: "AI provider failed to generate the plan. Please try again.",
        detail: aiErr.message,
      });
    }

    // Rescue: AI sometimes wraps response in an extra key e.g. {"prep": {"weeks": [...]}}
    if (weekPlan && !Array.isArray(weekPlan.weeks)) {
      const nested = Object.values(weekPlan).find(v => v && Array.isArray(v.weeks));
      if (nested) {
        console.warn("[POST /api/study-plans] Unwrapping nested AI response");
        weekPlan = nested;
      }
    }

    // Validate the AI response shape
    if (!weekPlan || !Array.isArray(weekPlan.weeks) || weekPlan.weeks.length === 0) {
      console.error("[POST /api/study-plans] AI returned unexpected shape:", JSON.stringify(weekPlan).slice(0, 300));
      return res.status(502).json({
        error: "AI returned an unexpected response. Please try again.",
      });
    }

    // Sanitize each week — fill missing fields with safe defaults
    const sanitizedWeeks = weekPlan.weeks.map((w, i) => ({
      week: w.week ?? i + 1,
      theme: w.theme ?? `Week ${i + 1}`,
      goals: Array.isArray(w.goals) ? w.goals : [],
      tasks: Array.isArray(w.tasks) ? w.tasks : [],
      resources: Array.isArray(w.resources) ? w.resources : [],
    }));

    const plan = await StudyPlan.create({
      userId: req.user._id,
      title,
      targetRole: role,
      targetCompany: targetCompany || null,
      durationWeeks: weeks,
      weeks: sanitizedWeeks,
    });

    console.log(`[POST /api/study-plans] Created plan ${plan._id} with ${sanitizedWeeks.length} weeks`);
    res.status(201).json({ plan });
  } catch (err) {
    console.error("[POST /api/study-plans] Unexpected error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/study-plans/:id
router.get("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json({ plan });
  } catch (err) {
    console.error(`[GET /api/study-plans/${req.params.id}]`, err.message);
    // Handle invalid MongoDB ObjectId
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/study-plans/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(`[DELETE /api/study-plans/${req.params.id}]`, err.message);
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;