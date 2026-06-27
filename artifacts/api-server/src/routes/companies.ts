import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, companiesTable } from "@workspace/db";
import { GenerateCompanyRoadmapParams } from "@workspace/api-zod";
import { generateJson } from "../lib/gemini";

const router: IRouter = Router();

router.get("/companies", async (req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).orderBy(companiesTable.name);
  res.json(companies);
});

router.post("/companies/:id/roadmap", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GenerateCompanyRoadmapParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, params.data.id));

  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }

  let roadmap: {
    frequentTopics: string[];
    interviewQuestions: string[];
    preparationStrategy: string;
    estimatedDays: number;
  };

  try {
    const prompt = `Generate a detailed placement preparation roadmap for ${company.name} software engineering interviews.

Respond with ONLY this JSON (no markdown):
{
  "frequentTopics": [<8-10 most frequently asked technical topics at ${company.name}>],
  "interviewQuestions": [<6-8 typical interview questions asked at ${company.name}>],
  "preparationStrategy": "<3-4 sentences describing the overall preparation strategy for ${company.name}>",
  "estimatedDays": <number of days recommended to prepare (30-120)>
}`;

    roadmap = await generateJson(prompt);
  } catch {
    roadmap = {
      frequentTopics: company.topics ?? ["Arrays", "Trees", "Dynamic Programming", "System Design"],
      interviewQuestions: [
        "Design a URL shortener",
        "Find the longest common subsequence",
        "Implement LRU cache",
        "Design a distributed system",
      ],
      preparationStrategy: `Focus on strong DSA fundamentals, system design concepts, and behavioral questions specific to ${company.name}'s culture.`,
      estimatedDays: 60,
    };
  }

  res.json({
    companyId: company.id,
    companyName: company.name,
    ...roadmap,
  });
});

export default router;
