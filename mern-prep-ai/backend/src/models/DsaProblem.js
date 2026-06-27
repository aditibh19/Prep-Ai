import mongoose from "mongoose";

const dsaProblemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  platform: { type: String, enum: ["LeetCode", "GeeksForGeeks", "HackerRank", "Codeforces", "Other"], default: "LeetCode" },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  topic: {
    type: String,
    enum: ["Array", "String", "LinkedList", "Tree", "Graph", "DP", "Backtracking", "Sorting", "Searching", "Math", "Greedy", "Stack", "Queue", "Heap", "Trie", "Other"],
    required: true,
  },
  status: { type: String, enum: ["solved", "attempted", "todo"], default: "todo" },
  notes: { type: String, default: "" },
  url: { type: String, default: "" },
  solvedAt: { type: Date },
  timeComplexity: { type: String, default: "" },
  spaceComplexity: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("DsaProblem", dsaProblemSchema);
