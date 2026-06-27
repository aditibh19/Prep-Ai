import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import ResumeReport from "../models/ResumeReport.js";
import { generateJSON } from "../lib/freeAI.js";

const router = express.Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Extract text from PDF buffer using pdfjs-dist
async function extractPdfText(buffer) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText.trim();
}

async function analyzeResume(resumeText, targetRole = "") {
  return generateJSON(
    `You are an expert ATS (Applicant Tracking System) and resume analyst.
    
    Analyze this resume${targetRole ? ` for the role of ${targetRole}` : ""}:
    
    """
    ${resumeText}
    """
    
    Return JSON:
    {
      "atsScore": <integer 0-100>,
      "sections": {
        "contact":    { "score": <0-10>, "feedback": "<feedback>" },
        "summary":    { "score": <0-10>, "feedback": "<feedback>" },
        "experience": { "score": <0-10>, "feedback": "<feedback>" },
        "education":  { "score": <0-10>, "feedback": "<feedback>" },
        "skills":     { "score": <0-10>, "feedback": "<feedback>" },
        "projects":   { "score": <0-10>, "feedback": "<feedback>" }
      },
      "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "strongKeywords":  ["keyword1", "keyword2", "keyword3"],
      "improvements": [
        "<specific improvement 1>",
        "<specific improvement 2>",
        "<specific improvement 3>",
        "<specific improvement 4>"
      ],
      "verdict": "<'Excellent', 'Good', 'Needs Work', or 'Major Revision Needed'>"
    }`
  );
}

// POST /api/resume/analyze
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || "";
    const targetRole = req.body.targetRole || "";

    if (req.file) {
      console.log("PDF received:", req.file.originalname, "size:", req.file.size);
      try {
        resumeText = await extractPdfText(req.file.buffer);
        console.log("Extracted text length:", resumeText?.length);

        if (!resumeText) {
          return res.status(400).json({
            error: "PDF has no readable text. It may be scanned/image-based. Please paste your resume text manually.",
          });
        }
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr.message);
        return res.status(400).json({
          error: "Could not read PDF. Please paste your resume text manually.",
        });
      }
    }

    if (!resumeText?.trim()) {
      return res.status(400).json({
        error: "Resume text is required. Upload a PDF or paste your resume.",
      });
    }

    const analysis = await analyzeResume(resumeText, targetRole);

    const report = await ResumeReport.create({
      userId: req.user._id,
      resumeText,
      targetRole,
      ...analysis,
    });

    res.status(201).json({ report });
  } catch (err) {
    console.error("Resume analyze error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resume/reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await ResumeReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-resumeText");
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resume/reports/:id
router.get("/reports/:id", async (req, res) => {
  try {
    const report = await ResumeReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;