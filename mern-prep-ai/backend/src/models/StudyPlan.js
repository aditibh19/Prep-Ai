import mongoose from "mongoose";

const weekSchema = new mongoose.Schema({
  week: Number,
  theme: String,
  goals: [String],
  tasks: [String],
  resources: [String],
});

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  targetRole: { type: String },
  targetCompany: { type: String },
  durationWeeks: { type: Number, default: 8 },
  currentWeek: { type: Number, default: 1 },
  weeks: [weekSchema],
  status: { type: String, enum: ["active", "completed", "paused"], default: "active" },
}, { timestamps: true });

export default mongoose.model("StudyPlan", studyPlanSchema);
