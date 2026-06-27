import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  dsaProblemsTable,
  resumeReportsTable,
  interviewSessionsTable,
  interviewMessagesTable,
} from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;

  const [dsaProblems, resumeReports, interviewSessions] = await Promise.all([
    db.select().from(dsaProblemsTable).where(eq(dsaProblemsTable.userId, userId)),
    db.select().from(resumeReportsTable).where(eq(resumeReportsTable.userId, userId)).orderBy(resumeReportsTable.createdAt),
    db.select().from(interviewSessionsTable).where(eq(interviewSessionsTable.userId, userId)).orderBy(interviewSessionsTable.createdAt),
  ]);

  const dsaSolved = dsaProblems.filter((p) => p.status === "Solved").length;
  const dsaPending = dsaProblems.filter((p) => p.status === "Pending").length;
  const dsaRevision = dsaProblems.filter((p) => p.status === "Revision").length;

  const completedInterviews = interviewSessions.filter((s) => s.status === "completed" && s.overallScore != null);
  const avgInterviewScore = completedInterviews.length > 0
    ? completedInterviews.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completedInterviews.length
    : null;

  const resumeScore = resumeReports.length > 0
    ? resumeReports[resumeReports.length - 1].atsScore
    : null;

  const upcomingInterviews = interviewSessions.filter((s) => s.status === "active").length;

  // Collect weak topics from interview sessions
  const allWeakAreas: string[] = interviewSessions.flatMap((s) => s.weakAreas ?? []);
  const weakTopicCounts: Record<string, number> = {};
  for (const topic of allWeakAreas) {
    weakTopicCounts[topic] = (weakTopicCounts[topic] ?? 0) + 1;
  }
  const weakTopics = Object.entries(weakTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  // Recent activity
  const recentActivity = [
    ...dsaProblems.slice(-3).map((p) => ({
      type: "dsa",
      description: `${p.status} problem: ${p.title}`,
      createdAt: p.updatedAt,
    })),
    ...resumeReports.slice(-2).map((r) => ({
      type: "resume",
      description: `Resume analyzed: ${r.fileName} (ATS: ${r.atsScore}%)`,
      createdAt: r.createdAt,
    })),
    ...interviewSessions.slice(-2).map((s) => ({
      type: "interview",
      description: `${s.role} interview (${s.difficulty})${s.overallScore ? ` — Score: ${s.overallScore}/10` : ""}`,
      createdAt: s.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Weekly progress — last 7 days
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split("T")[0];
    const dayName = weekDays[d.getDay()];
    const problemsSolved = dsaProblems.filter((p) => {
      const pd = new Date(p.updatedAt).toISOString().split("T")[0];
      return pd === dayStr && p.status === "Solved";
    }).length;
    const interviewsDone = interviewSessions.filter((s) => {
      const sd = new Date(s.createdAt).toISOString().split("T")[0];
      return sd === dayStr;
    }).length;
    return { day: dayName, problemsSolved, interviewsDone };
  });

  res.json({
    dsaSolved,
    dsaPending,
    dsaRevision,
    avgInterviewScore,
    resumeScore,
    recentActivity,
    weeklyProgress,
    upcomingInterviews,
    weakTopics,
  });
});

export default router;
