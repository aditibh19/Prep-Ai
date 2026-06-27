import express from "express";
import authMiddleware from "../middleware/auth.js";
import InterviewSession from "../models/InterviewSession.js";
import { generateText, generateJSON } from "../lib/freeAI.js";

const router = express.Router();
router.use(authMiddleware);

// POST /api/interviews/start
router.post("/start", async (req, res) => {
  try {
    const { role, difficulty = "Medium", topic = "General" } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required" });

    const session = await InterviewSession.create({
      userId: req.user._id,
      role,
      difficulty,
      topic,
      messages: [],
    });

    const firstQuestion = await generateText(
      `You are a senior ${role} interviewer conducting a ${difficulty} difficulty interview on ${topic}. 
      Start with a warm greeting and your first technical question. Keep it concise and professional.
      Do not give hints or the answer. Just greet and ask one focused question.`
    );

    session.messages.push({ role: "ai", content: firstQuestion });
    session.questionCount = 1;
    await session.save();

    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interviews — list
router.get("/", async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-messages");
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interviews/:id
router.get("/:id", async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interviews/:id/answer
router.post("/:id/answer", async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) return res.status(400).json({ error: "Answer is required" });

    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status === "completed") return res.status(400).json({ error: "Interview already completed" });

    const history = session.messages.map(m => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n");

    const raw = await generateJSON(
      `You are evaluating a ${session.role} interview (${session.difficulty} difficulty, topic: ${session.topic}).
      
      Conversation so far:
      ${history}
      
      Candidate's latest answer: "${answer}"
      
      Evaluate the answer and respond with JSON:
      {
        "score": <integer 0-10>,
        "feedback": "<2-3 sentence specific feedback on this answer>",
        "followUp": "<your next question: either a follow-up to probe deeper or a new topic question. Make it natural and conversational.>",
        "isLastQuestion": <true if questionCount >= ${session.maxQuestions}, else false>
      }`
    );

    const evaluation = {
      score: typeof raw?.score === "number" ? Math.min(10, Math.max(0, Math.round(raw.score))) : 5,
      feedback: typeof raw?.feedback === "string" && raw.feedback.length > 0
        ? raw.feedback
        : "Answer evaluated.",
      followUp: typeof raw?.followUp === "string" && raw.followUp.length > 0
        ? raw.followUp
        : "Can you elaborate on your approach?",
      isLastQuestion: !!raw?.isLastQuestion,
    };

    session.messages.push({
      role: "user",
      content: answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    });

    session.messages.push({ role: "ai", content: evaluation.followUp });
    session.questionCount += 1;

    if (session.questionCount >= session.maxQuestions || evaluation.isLastQuestion) {
      session.status = "completed";
    }

    await session.save();
    res.json({ session, evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interviews/:id/end
router.post("/:id/end", async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const answeredMessages = session.messages.filter(m => m.role === "user");
    const avgScore = answeredMessages.length
      ? answeredMessages.reduce((s, m) => s + (m.score || 5), 0) / answeredMessages.length
      : 0;

    const convo = session.messages.map(m => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n");

    const raw = await generateJSON(
      `You just conducted a ${session.role} interview (${session.difficulty}, topic: ${session.topic}).
      
      Full conversation:
      ${convo}
      
      Average per-answer score: ${avgScore.toFixed(1)}/10
      
      Generate a comprehensive final report as JSON. You MUST provide AT LEAST 2 items
      in "strengths" and AT LEAST 2 items in "improvements" — never return an empty array
      for either field. Respond with JSON in this exact shape:
      {
        "overallScore": <integer 0-100>,
        "technicalScore": <integer 0-100>,
        "communicationScore": <integer 0-100>,
        "problemSolvingScore": <integer 0-100>,
        "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
        "improvements": ["<area 1>", "<area 2>", "<area 3>"],
        "verdict": "<'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire'>",
        "detailedFeedback": "<3-4 paragraph comprehensive feedback>"
      }`
    );

    const clamp = (v, min = 0, max = 100) =>
      typeof v === "number" ? Math.min(max, Math.max(min, Math.round(v))) : 50;
    const VERDICTS = ["Strong Hire", "Hire", "Maybe", "No Hire"];

    const report = {
      overallScore: clamp(raw?.overallScore),
      technicalScore: clamp(raw?.technicalScore),
      communicationScore: clamp(raw?.communicationScore),
      problemSolvingScore: clamp(raw?.problemSolvingScore),
      strengths: Array.isArray(raw?.strengths) && raw.strengths.length > 0
        ? raw.strengths.slice(0, 5)
        : ["Completed the interview", "Engaged with all questions asked"],
      improvements: Array.isArray(raw?.improvements) && raw.improvements.length > 0
        ? raw.improvements.slice(0, 5)
        : ["Provide more specific examples in answers", "Practice articulating technical concepts aloud"],
      verdict: VERDICTS.includes(raw?.verdict) ? raw.verdict : "Maybe",
      detailedFeedback: typeof raw?.detailedFeedback === "string" ? raw.detailedFeedback : "Interview completed.",
    };

    session.status = "completed";
    session.report = report;
    await session.save();

    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;