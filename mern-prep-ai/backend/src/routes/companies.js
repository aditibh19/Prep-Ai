import express from "express";
import authMiddleware from "../middleware/auth.js";
import { generateJSON } from "../lib/freeAI.js";

const router = express.Router();
router.use(authMiddleware);

const COMPANIES = [
  { id: "amazon", name: "Amazon", domain: "E-commerce / Cloud", logo: "🟠", difficulty: "Hard" },
  { id: "google", name: "Google", domain: "Search / Ads / Cloud", logo: "🔵", difficulty: "Hard" },
  { id: "microsoft", name: "Microsoft", domain: "Enterprise / Cloud", logo: "🟦", difficulty: "Hard" },
  { id: "meta", name: "Meta", domain: "Social Media / AR/VR", logo: "🔵", difficulty: "Hard" },
  { id: "adobe", name: "Adobe", domain: "Design / SaaS", logo: "🔴", difficulty: "Medium" },
  { id: "flipkart", name: "Flipkart", domain: "E-commerce", logo: "🟡", difficulty: "Medium" },
  { id: "atlassian", name: "Atlassian", domain: "Dev Tools / SaaS", logo: "🔷", difficulty: "Medium" },
  { id: "goldman", name: "Goldman Sachs", domain: "Finance / Fintech", logo: "⬜", difficulty: "Hard" },
  { id: "uber", name: "Uber", domain: "Ride-sharing / Maps", logo: "⬛", difficulty: "Medium" },
  { id: "walmart", name: "Walmart Labs", domain: "Retail Tech", logo: "🟦", difficulty: "Medium" },
  { id: "infosys", name: "Infosys", domain: "IT Services", logo: "🟤", difficulty: "Easy" },
  { id: "tcs", name: "TCS", domain: "IT Services", logo: "🔵", difficulty: "Easy" },
];

// GET /api/companies
router.get("/", (_req, res) => {
  res.json({ companies: COMPANIES });
});

// POST /api/companies/:id/roadmap
router.post("/:id/roadmap", async (req, res) => {
  try {
    const company = COMPANIES.find(c => c.id === req.params.id);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const { role = "Software Engineer", experienceLevel = "fresher" } = req.body;

    const roadmap = await generateJSON(
      `Create a detailed interview preparation roadmap for a ${experienceLevel} applying as ${role} at ${company.name} (${company.domain}).
      
      Return JSON:
      {
        "overview": "<2 sentence description of ${company.name}'s interview process>",
        "totalWeeks": 8,
        "phases": [
          {
            "phase": "<phase name>",
            "weeks": "<e.g. Week 1-2>",
            "focus": "<main focus>",
            "topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
            "dailyHours": <number>
          }
        ],
        "mustKnowTopics": ["<DSA topic>", "<system design topic>", "<CS fundamental>"],
        "interviewRounds": [
          { "round": "<round name>", "duration": "<duration>", "description": "<what to expect>" }
        ],
        "tips": ["<company-specific tip 1>", "<tip 2>", "<tip 3>"],
        "resources": ["<book or course>", "<practice platform>", "<other resource>"]
      }`
    );

    res.json({ company, role, roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;