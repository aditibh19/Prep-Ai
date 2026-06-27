import express from "express";
import authMiddleware from "../middleware/auth.js";
import DsaProblem from "../models/DsaProblem.js";
import InterviewSession from "../models/InterviewSession.js";
import ResumeReport from "../models/ResumeReport.js";

const router = express.Router();
router.use(authMiddleware);

// GET /api/analytics/overview
router.get("/overview", async (req, res) => {
  try {
    const uid = req.user._id;

    const [
      totalDsa, solvedDsa,
      totalInterviews, completedInterviews,
      totalResumes,
      recentInterviews,
    ] = await Promise.all([
      DsaProblem.countDocuments({ userId: uid }),
      DsaProblem.countDocuments({ userId: uid, status: "solved" }),
      InterviewSession.countDocuments({ userId: uid }),
      InterviewSession.countDocuments({ userId: uid, status: "completed" }),
      ResumeReport.countDocuments({ userId: uid }),
      InterviewSession.find({ userId: uid, status: "completed", "report.overallScore": { $exists: true } })
        .sort({ updatedAt: -1 }).limit(10)
        .select("report.overallScore createdAt role"),
    ]);

    // Average interview score
    const avgScore = recentInterviews.length
      ? Math.round(recentInterviews.reduce((s, i) => s + (i.report?.overallScore || 0), 0) / recentInterviews.length)
      : 0;

    // Score trend (last 7 interviews)
    const scoreTrend = recentInterviews.slice(0, 7).reverse().map((s, i) => ({
      label: `Int. ${i + 1}`,
      score: s.report?.overallScore || 0,
      role: s.role,
    }));

    // DSA by topic
    const dsaByTopic = await DsaProblem.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$topic", total: { $sum: 1 }, solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } } } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      summary: { totalDsa, solvedDsa, totalInterviews, completedInterviews, totalResumes, avgScore },
      scoreTrend,
      dsaByTopic,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
