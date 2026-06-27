import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, resumeReportsTable } from "@workspace/db";
import { AnalyzeResumeBody, GetResumeReportParams } from "@workspace/api-zod";
import { generateJson } from "../lib/gemini";

const router: IRouter = Router();

interface ResumeAnalysisResult {
  atsScore: number;
  missingSkills: string[];
  improvements: string[];
  projectsFeedback: string;
  interviewQuestions: string[];
}

router.post("/resume/analyze", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = AnalyzeResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fileName, resumeText } = parsed.data;

  const prompt = `You are an expert ATS resume analyzer. Analyze the following resume text and respond with a JSON object.

Resume:
${resumeText}

Respond with ONLY this JSON structure (no markdown, no extra text):
{
  "atsScore": <number 0-100, the ATS compatibility score>,
  "missingSkills": [<array of 3-6 important skills/keywords missing from the resume>],
  "improvements": [<array of 4-6 specific actionable improvements>],
  "projectsFeedback": "<string: 2-3 sentences of feedback on projects section>",
  "interviewQuestions": [<array of 5 interview questions that would be asked based on this resume>]
}`;

  let analysis: ResumeAnalysisResult;
  try {
    analysis = await generateJson<ResumeAnalysisResult>(prompt);
  } catch (err) {
    req.log.error({ err }, "Gemini resume analysis failed");
    res.status(500).json({ error: "AI analysis failed. Check your GEMINI_API_KEY." });
    return;
  }

  const [report] = await db
    .insert(resumeReportsTable)
    .values({
      userId: req.user.id,
      fileName,
      rawText: resumeText,
      atsScore: analysis.atsScore ?? 0,
      missingSkills: analysis.missingSkills ?? [],
      improvements: analysis.improvements ?? [],
      projectsFeedback: analysis.projectsFeedback ?? "",
      interviewQuestions: analysis.interviewQuestions ?? [],
    })
    .returning();

  res.status(201).json(report);
});

router.get("/resume/reports", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const reports = await db
    .select()
    .from(resumeReportsTable)
    .where(eq(resumeReportsTable.userId, req.user.id))
    .orderBy(resumeReportsTable.createdAt);
  res.json(reports);
});

router.get("/resume/reports/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetResumeReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db
    .select()
    .from(resumeReportsTable)
    .where(and(eq(resumeReportsTable.id, params.data.id), eq(resumeReportsTable.userId, req.user.id)));
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

export default router;
