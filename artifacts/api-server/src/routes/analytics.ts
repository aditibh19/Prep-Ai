import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, interviewSessionsTable, dsaProblemsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/analytics/overview", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;

  const [interviewSessions, dsaProblems] = await Promise.all([
    db.select().from(interviewSessionsTable).where(eq(interviewSessionsTable.userId, userId)).orderBy(interviewSessionsTable.createdAt),
    db.select().from(dsaProblemsTable).where(eq(dsaProblemsTable.userId, userId)),
  ]);

  // Interview score trend
  const interviewScoreTrend = interviewSessions
    .filter((s) => s.overallScore != null)
    .map((s) => ({
      date: s.createdAt,
      score: s.overallScore as number,
      role: s.role,
    }));

  // DSA progress by topic
  const topicMap: Record<string, { count: number; solved: number }> = {};
  for (const p of dsaProblems) {
    if (!topicMap[p.topic]) topicMap[p.topic] = { count: 0, solved: 0 };
    topicMap[p.topic].count++;
    if (p.status === "Solved") topicMap[p.topic].solved++;
  }
  const dsaProgressByTopic = Object.entries(topicMap).map(([topic, v]) => ({ topic, ...v }));

  // Topic strength from interviews
  const allTopics: Record<string, { strong: number; weak: number }> = {};
  for (const s of interviewSessions) {
    for (const topic of s.strongAreas ?? []) {
      if (!allTopics[topic]) allTopics[topic] = { strong: 0, weak: 0 };
      allTopics[topic].strong++;
    }
    for (const topic of s.weakAreas ?? []) {
      if (!allTopics[topic]) allTopics[topic] = { strong: 0, weak: 0 };
      allTopics[topic].weak++;
    }
  }
  const topicStrength = Object.entries(allTopics).map(([topic, counts]) => {
    const total = counts.strong + counts.weak;
    const score = total > 0 ? (counts.strong / total) * 10 : 5;
    const strength: "Strong" | "Weak" | "Moderate" =
      score >= 7 ? "Strong" : score >= 4 ? "Moderate" : "Weak";
    return { topic, strength, score };
  });

  // Weekly study hours (estimated from activity)
  const now = new Date();
  const weeklyStudyHours = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekLabel = `W${i + 1}`;

    const weekProblems = dsaProblems.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    const weekInterviews = interviewSessions.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;

    // Estimate: 30 min per problem, 90 min per interview
    const hours = (weekProblems * 0.5 + weekInterviews * 1.5);
    return { week: weekLabel, hours: Math.round(hours * 10) / 10 };
  });

  const completedInterviews = interviewSessions.filter((s) => s.overallScore != null);
  const avgScore = completedInterviews.length > 0
    ? completedInterviews.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completedInterviews.length
    : null;

  res.json({
    interviewScoreTrend,
    dsaProgressByTopic,
    topicStrength,
    weeklyStudyHours,
    interviewHistory: interviewSessions,
    totalInterviews: interviewSessions.length,
    avgScore,
  });
});

export default router;
