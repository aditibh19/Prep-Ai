import mongoose from "mongoose";

const resumeReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resumeText: { type: String, required: true },
  targetRole: { type: String, default: "" },
  atsScore: { type: Number, min: 0, max: 100 },
  sections: {
    contact: { score: Number, feedback: String },
    summary: { score: Number, feedback: String },
    experience: { score: Number, feedback: String },
    education: { score: Number, feedback: String },
    skills: { score: Number, feedback: String },
    projects: { score: Number, feedback: String },
  },
  missingKeywords: [String],
  strongKeywords: [String],
  improvements: [String],
  verdict: { type: String },
}, { timestamps: true });

export default mongoose.model("ResumeReport", resumeReportSchema);
