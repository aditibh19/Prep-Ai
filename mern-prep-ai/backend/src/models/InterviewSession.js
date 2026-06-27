import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["ai", "user"], required: true },
  content: { type: String, required: true },
  score: { type: Number, min: 0, max: 10 },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  topic: { type: String, default: "General" },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  messages: [messageSchema],
  questionCount: { type: Number, default: 0 },
  maxQuestions: { type: Number, default: 8 },
  // Final report (generated when interview ends)
  report: {
    overallScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    strengths: [String],
    improvements: [String],
    verdict: String,
    detailedFeedback: String,
  },
}, { timestamps: true });

export default mongoose.model("InterviewSession", interviewSessionSchema);
