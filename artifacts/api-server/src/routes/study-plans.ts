import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, studyPlansTable } from "@workspace/db";
import { CreateStudyPlanBody, GetStudyPlanParams } from "@workspace/api-zod";
import { generateJson } from "../lib/gemini";

const router: IRouter = Router();

router.get("/study-plans", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const plans = await db
    .select()
    .from(studyPlansTable)
    .where(eq(studyPlansTable.userId, req.user.id))
    .orderBy(studyPlansTable.createdAt);
  res.json(plans);
});

router.post("/study-plans", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateStudyPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { targetCompany, daysLeft } = parsed.data;
  const weeks = Math.ceil(daysLeft / 7);

  let planWeeks: Array<{ week: number; topics: string[]; description: string }>;

  try {
    const prompt = `Create a ${daysLeft}-day study plan (${weeks} weeks) to prepare for ${targetCompany} software engineering interviews.

Respond with ONLY this JSON array (no markdown):
[
  {
    "week": 1,
    "topics": [<2-4 topics to study this week>],
    "description": "<1-2 sentences describing the focus and goals for this week>"
  },
  ... (one entry per week, exactly ${weeks} weeks)
]`;

    planWeeks = await generateJson(prompt);
  } catch {
    const defaultWeeks: Array<{ week: number; topics: string[]; description: string }> = [
      { week: 1, topics: ["Arrays", "Strings", "Two Pointers"], description: "Focus on fundamental data structures and array manipulation techniques." },
      { week: 2, topics: ["Linked Lists", "Stacks", "Queues"], description: "Master linear data structures and their real-world applications." },
      { week: 3, topics: ["Trees", "Binary Search Trees", "Recursion"], description: "Build intuition for tree traversals and recursive problem solving." },
      { week: 4, topics: ["Graphs", "BFS", "DFS"], description: "Explore graph algorithms and their applications in network problems." },
      { week: 5, topics: ["Dynamic Programming", "Memoization"], description: "Tackle optimization problems using dynamic programming patterns." },
      { week: 6, topics: ["System Design", "Mock Interviews"], description: "Consolidate knowledge and practice with full mock interviews." },
    ];
    planWeeks = defaultWeeks.slice(0, weeks);
    if (planWeeks.length < weeks) {
      for (let i = planWeeks.length + 1; i <= weeks; i++) {
        planWeeks.push({ week: i, topics: ["Review", "Mock Interviews"], description: "Final review and interview practice." });
      }
    }
  }

  const [plan] = await db
    .insert(studyPlansTable)
    .values({ userId: req.user.id, targetCompany, daysLeft, weeks: planWeeks })
    .returning();

  res.status(201).json(plan);
});

router.get("/study-plans/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetStudyPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [plan] = await db
    .select()
    .from(studyPlansTable)
    .where(and(eq(studyPlansTable.id, params.data.id), eq(studyPlansTable.userId, req.user.id)));
  if (!plan) {
    res.status(404).json({ error: "Study plan not found" });
    return;
  }
  res.json(plan);
});

export default router;
