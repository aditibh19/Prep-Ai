import express from "express";
import authMiddleware from "../middleware/auth.js";
import DsaProblem from "../models/DsaProblem.js";

const router = express.Router();
router.use(authMiddleware);

// GET /api/dsa  — list with filters
router.get("/", async (req, res) => {
  try {
    const { topic, difficulty, status, search } = req.query;
    const query = { userId: req.user._id };
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };
    const problems = await DsaProblem.find(query).sort({ createdAt: -1 });
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dsa
router.post("/", async (req, res) => {
  try {
    const { title, platform, difficulty, topic, status, notes, url, timeComplexity, spaceComplexity } = req.body;
    if (!title || !difficulty || !topic)
      return res.status(400).json({ error: "title, difficulty, topic are required" });

    const problem = await DsaProblem.create({
      userId: req.user._id,
      title, platform, difficulty, topic, status, notes, url, timeComplexity, spaceComplexity,
      solvedAt: status === "solved" ? new Date() : undefined,
    });
    res.status(201).json({ problem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/dsa/:id
router.patch("/:id", async (req, res) => {
  try {
    const problem = await DsaProblem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...req.body,
        ...(req.body.status === "solved" ? { solvedAt: new Date() } : {}),
      },
      { new: true }
    );
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json({ problem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/dsa/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await DsaProblem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) return res.status(404).json({ error: "Problem not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dsa/stats
router.get("/stats", async (req, res) => {
  try {
    const [byTopic, byDifficulty, byStatus, recentlySolved] = await Promise.all([
      DsaProblem.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: "$topic", total: { $sum: 1 }, solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } } } },
        { $sort: { total: -1 } },
      ]),
      DsaProblem.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: "$difficulty", total: { $sum: 1 }, solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } } } },
      ]),
      DsaProblem.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      DsaProblem.find({ userId: req.user._id, status: "solved" })
        .sort({ solvedAt: -1 }).limit(7).select("title difficulty topic solvedAt"),
    ]);
    res.json({ byTopic, byDifficulty, byStatus, recentlySolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
