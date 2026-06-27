import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, dsaProblemsTable } from "@workspace/db";
import {
  ListDsaProblemsQueryParams,
  CreateDsaProblemBody,
  GetDsaProblemParams,
  UpdateDsaProblemParams,
  UpdateDsaProblemBody,
  DeleteDsaProblemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dsa/problems", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = ListDsaProblemsQueryParams.safeParse(req.query);
  const userId = req.user.id;

  let query = db.select().from(dsaProblemsTable).where(eq(dsaProblemsTable.userId, userId)).$dynamic();

  if (params.success) {
    const conditions = [eq(dsaProblemsTable.userId, userId)];
    if (params.data.topic) conditions.push(eq(dsaProblemsTable.topic, params.data.topic));
    if (params.data.difficulty) conditions.push(eq(dsaProblemsTable.difficulty, params.data.difficulty));
    if (params.data.status) conditions.push(eq(dsaProblemsTable.status, params.data.status));
    query = db.select().from(dsaProblemsTable).where(and(...conditions)).$dynamic();
  }

  const problems = await query.orderBy(dsaProblemsTable.createdAt);
  res.json(problems);
});

router.post("/dsa/problems", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateDsaProblemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [problem] = await db
    .insert(dsaProblemsTable)
    .values({ ...parsed.data, userId: req.user.id })
    .returning();
  res.status(201).json(problem);
});

router.get("/dsa/problems/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetDsaProblemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [problem] = await db
    .select()
    .from(dsaProblemsTable)
    .where(and(eq(dsaProblemsTable.id, params.data.id), eq(dsaProblemsTable.userId, req.user.id)));
  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }
  res.json(problem);
});

router.patch("/dsa/problems/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateDsaProblemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDsaProblemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [problem] = await db
    .update(dsaProblemsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(dsaProblemsTable.id, params.data.id), eq(dsaProblemsTable.userId, req.user.id)))
    .returning();
  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }
  res.json(problem);
});

router.delete("/dsa/problems/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteDsaProblemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(dsaProblemsTable)
    .where(and(eq(dsaProblemsTable.id, params.data.id), eq(dsaProblemsTable.userId, req.user.id)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/dsa/stats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const problems = await db
    .select()
    .from(dsaProblemsTable)
    .where(eq(dsaProblemsTable.userId, req.user.id));

  const total = problems.length;
  const solved = problems.filter((p) => p.status === "Solved").length;
  const pending = problems.filter((p) => p.status === "Pending").length;
  const revision = problems.filter((p) => p.status === "Revision").length;

  // By topic
  const topicMap: Record<string, { count: number; solved: number }> = {};
  for (const p of problems) {
    if (!topicMap[p.topic]) topicMap[p.topic] = { count: 0, solved: 0 };
    topicMap[p.topic].count++;
    if (p.status === "Solved") topicMap[p.topic].solved++;
  }
  const byTopic = Object.entries(topicMap).map(([topic, v]) => ({ topic, ...v }));

  // By difficulty
  const diffMap: Record<string, { count: number; solved: number }> = {};
  for (const p of problems) {
    if (!diffMap[p.difficulty]) diffMap[p.difficulty] = { count: 0, solved: 0 };
    diffMap[p.difficulty].count++;
    if (p.status === "Solved") diffMap[p.difficulty].solved++;
  }
  const byDifficulty = Object.entries(diffMap).map(([difficulty, v]) => ({ difficulty, ...v }));

  // Weekly streak — last 14 days
  const now = new Date();
  const weeklyStreak = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const date = d.toISOString().split("T")[0];
    const count = problems.filter((p) => {
      return new Date(p.updatedAt).toISOString().split("T")[0] === date && p.status === "Solved";
    }).length;
    return { date, count };
  });

  res.json({ total, solved, pending, revision, byTopic, byDifficulty, weeklyStreak });
});

export default router;
