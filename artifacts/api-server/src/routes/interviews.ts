import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  interviewSessionsTable,
  interviewMessagesTable,
} from "@workspace/db";
import {
  StartInterviewBody,
  GetInterviewParams,
  SubmitInterviewAnswerParams,
  SubmitInterviewAnswerBody,
  EndInterviewParams,
  GetInterviewReportParams,
} from "@workspace/api-zod";
import { generateJson, generateText } from "../lib/gemini";

const router: IRouter = Router();

const MAX_QUESTIONS = 8;

router.get("/interviews", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const sessions = await db
    .select()
    .from(interviewSessionsTable)
    .where(eq(interviewSessionsTable.userId, req.user.id))
    .orderBy(interviewSessionsTable.createdAt);
  res.json(sessions);
});

router.post("/interviews", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = StartInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { role, difficulty } = parsed.data;

  const [session] = await db
    .insert(interviewSessionsTable)
    .values({ userId: req.user.id, role, difficulty, status: "active", questionCount: 0 })
    .returning();

  // Generate the opening message + first question
  const openingPrompt = `You are a professional ${role} developer interviewer. Start a ${difficulty} difficulty technical interview.

Respond with ONLY this JSON (no markdown):
{
  "greeting": "<a warm 1-sentence welcome greeting addressing the candidate>",
  "firstQuestion": "<the first technical interview question appropriate for ${role} at ${difficulty} level>"
}`;

  let opening: { greeting: string; firstQuestion: string };
  try {
    opening = await generateJson<{ greeting: string; firstQuestion: string }>(openingPrompt);
  } catch {
    opening = {
      greeting: `Welcome! Let's begin your ${role} interview.`,
      firstQuestion: `Can you explain the core concepts of ${role} development?`,
    };
  }

  const aiMessage = `${opening.greeting}\n\nQuestion 1: ${opening.firstQuestion}`;

  await db.insert(interviewMessagesTable).values({
    sessionId: session.id,
    role: "ai",
    content: aiMessage,
    score: null,
    feedback: null,
  });

  await db
    .update(interviewSessionsTable)
    .set({ questionCount: 1, updatedAt: new Date() })
    .where(eq(interviewSessionsTable.id, session.id));

  res.status(201).json({ ...session, questionCount: 1 });
});

router.get("/interviews/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(interviewSessionsTable)
    .where(and(eq(interviewSessionsTable.id, params.data.id), eq(interviewSessionsTable.userId, req.user.id)));

  if (!session) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  const messages = await db
    .select()
    .from(interviewMessagesTable)
    .where(eq(interviewMessagesTable.sessionId, session.id))
    .orderBy(interviewMessagesTable.createdAt);

  res.json({ ...session, messages });
});

router.post("/interviews/:id/answer", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = SubmitInterviewAnswerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SubmitInterviewAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(interviewSessionsTable)
    .where(and(eq(interviewSessionsTable.id, params.data.id), eq(interviewSessionsTable.userId, req.user.id)));

  if (!session) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }
  if (session.status === "completed") {
    res.status(400).json({ error: "Interview already completed" });
    return;
  }

  // Save user's answer
  await db.insert(interviewMessagesTable).values({
    sessionId: session.id,
    role: "user",
    content: parsed.data.answer,
  });

  const messages = await db
    .select()
    .from(interviewMessagesTable)
    .where(eq(interviewMessagesTable.sessionId, session.id))
    .orderBy(interviewMessagesTable.createdAt);

  const questionCount = session.questionCount ?? 0;
  const shouldEnd = questionCount >= MAX_QUESTIONS;

  // Build conversation history for context
  const history = messages.map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n");

  let aiResponse: {
    type: "cross_question" | "next_question" | "end";
    message: string;
    score: number;
    feedback: string;
  };

  try {
    const prompt = `You are a professional ${session.role} interviewer conducting a ${session.difficulty} difficulty interview.

Conversation so far:
${history}

The candidate just answered. Evaluate their answer and decide:
- If their answer was partial, ask a targeted cross-question (follow-up on what they said)
- If their answer was complete, ask the next question (question ${questionCount + 1} of ${MAX_QUESTIONS})
- If this is question ${MAX_QUESTIONS} or beyond, end the interview

Respond with ONLY this JSON (no markdown):
{
  "type": "${shouldEnd ? "end" : "cross_question or next_question"}",
  "message": "<your response as the interviewer>",
  "score": <number 1-10 for the candidate's last answer>,
  "feedback": "<1-2 sentences of specific feedback on the last answer>"
}`;

    aiResponse = await generateJson(prompt);
    if (!["cross_question", "next_question", "end"].includes(aiResponse.type)) {
      aiResponse.type = shouldEnd ? "end" : "next_question";
    }
  } catch {
    aiResponse = {
      type: shouldEnd ? "end" : "next_question",
      message: shouldEnd
        ? "Thank you for your responses. Let's wrap up the interview."
        : "Good answer. Let's move to the next question.",
      score: 7,
      feedback: "Keep practicing for more depth.",
    };
  }

  // Save AI response message
  await db.insert(interviewMessagesTable).values({
    sessionId: session.id,
    role: "ai",
    content: aiResponse.message,
    score: aiResponse.score,
    feedback: aiResponse.feedback,
  });

  const newQuestionCount = aiResponse.type === "cross_question" ? questionCount : questionCount + 1;

  if (aiResponse.type === "end") {
    await db
      .update(interviewSessionsTable)
      .set({ status: "completed", questionCount: newQuestionCount, updatedAt: new Date() })
      .where(eq(interviewSessionsTable.id, session.id));
  } else {
    await db
      .update(interviewSessionsTable)
      .set({ questionCount: newQuestionCount, updatedAt: new Date() })
      .where(eq(interviewSessionsTable.id, session.id));
  }

  res.json({
    message: aiResponse.message,
    type: aiResponse.type,
    score: aiResponse.score,
    feedback: aiResponse.feedback,
    questionNumber: newQuestionCount,
  });
});

router.post("/interviews/:id/end", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = EndInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(interviewSessionsTable)
    .where(and(eq(interviewSessionsTable.id, params.data.id), eq(interviewSessionsTable.userId, req.user.id)));

  if (!session) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  const messages = await db
    .select()
    .from(interviewMessagesTable)
    .where(eq(interviewMessagesTable.sessionId, session.id))
    .orderBy(interviewMessagesTable.createdAt);

  const scoredMessages = messages.filter((m) => m.role === "ai" && m.score != null);
  const avgScore = scoredMessages.length > 0
    ? scoredMessages.reduce((sum, m) => sum + (m.score ?? 0), 0) / scoredMessages.length
    : 5;

  const conversationText = messages.map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n");

  let report: {
    overallScore: number;
    confidence: number;
    communication: number;
    technicalSkills: number;
    strongAreas: string[];
    weakAreas: string[];
    recommendedTopics: string[];
  };

  try {
    const prompt = `Analyze this ${session.role} interview conversation and generate a comprehensive report.

Conversation:
${conversationText}

Respond with ONLY this JSON (no markdown):
{
  "overallScore": <number 1-10>,
  "confidence": <number 1-10>,
  "communication": <number 1-10>,
  "technicalSkills": <number 1-10>,
  "strongAreas": [<3-4 specific topics the candidate did well in>],
  "weakAreas": [<3-4 specific topics to improve>],
  "recommendedTopics": [<4-5 specific topics to study>]
}`;

    report = await generateJson(prompt);
  } catch {
    report = {
      overallScore: Math.round(avgScore),
      confidence: Math.round(avgScore * 0.9),
      communication: Math.round(avgScore * 0.95),
      technicalSkills: Math.round(avgScore),
      strongAreas: ["Problem solving", "Communication"],
      weakAreas: ["System design", "Edge cases"],
      recommendedTopics: ["Data structures", "Algorithms", "System design", "OS concepts"],
    };
  }

  await db
    .update(interviewSessionsTable)
    .set({
      status: "completed",
      overallScore: report.overallScore,
      confidence: report.confidence,
      communication: report.communication,
      technicalSkills: report.technicalSkills,
      strongAreas: report.strongAreas,
      weakAreas: report.weakAreas,
      recommendedTopics: report.recommendedTopics,
      updatedAt: new Date(),
    })
    .where(eq(interviewSessionsTable.id, session.id));

  res.json({ sessionId: session.id, ...report });
});

router.get("/interviews/:id/report", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetInterviewReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(interviewSessionsTable)
    .where(and(eq(interviewSessionsTable.id, params.data.id), eq(interviewSessionsTable.userId, req.user.id)));

  if (!session) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }
  if (session.status !== "completed") {
    res.status(400).json({ error: "Interview not yet completed" });
    return;
  }

  res.json({
    sessionId: session.id,
    overallScore: session.overallScore ?? 0,
    confidence: session.confidence ?? 0,
    communication: session.communication ?? 0,
    technicalSkills: session.technicalSkills ?? 0,
    strongAreas: session.strongAreas ?? [],
    weakAreas: session.weakAreas ?? [],
    recommendedTopics: session.recommendedTopics ?? [],
  });
});

export default router;
