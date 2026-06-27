import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";
import { toast } from "sonner";
import { FileSearch, Loader2, ChevronRight, Upload, X } from "lucide-react";

function ScoreGauge({ score }) {
  const color = score >= 70 ? "#4ade80" : score >= 50 ? "#facc15" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 60" className="w-36">
        <path d="M10 55 A 40 40 0 0 1 90 55" stroke="#1e1e1e" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M10 55 A 40 40 0 0 1 90 55" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`} />
        <text x="50" y="52" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="JetBrains Mono">{score}</text>
      </svg>
      <span className="text-xs text-white/30 font-mono">ATS Score</span>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [activeReport, setActiveReport] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const { data: reportsData } = useQuery({
    queryKey: ["resume-reports"],
    queryFn: () => api.get("/resume/reports").then(r => r.data),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => {
      if (pdfFile) {
        const form = new FormData();
        form.append("resume", pdfFile);
        form.append("targetRole", targetRole);
        // DO NOT set Content-Type header — browser sets it automatically with correct boundary
        return api.post("/resume/analyze", form);
      }
      return api.post("/resume/analyze", { resumeText, targetRole });
    },
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ["resume-reports"] });
      setActiveReport(data.report);
      toast.success("Analysis complete");
    },
    onError: (e) => toast.error(e.response?.data?.error || "Analysis failed"),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Only PDF files are supported"); return; }
    setPdfFile(file);
    setResumeText("");
  };

  const removePdf = () => {
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmit = (pdfFile || resumeText.trim()) && !analyzeMutation.isPending;
  const report = activeReport;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">ATS Powered</p>
        <h1 className="text-2xl font-bold">Resume Analyzer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 p-6 flex flex-col gap-4">
          <h2 className="font-bold text-sm">Upload or Paste Resume</h2>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Target Role (optional)</label>
            <input placeholder="e.g. Software Engineer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Upload PDF</label>
            {pdfFile ? (
              <div className="flex items-center gap-2 px-3 py-2 border border-primary/30 bg-primary/5 text-sm">
                <span className="flex-1 text-white/70 truncate">{pdfFile.name}</span>
                <button onClick={removePdf} className="text-white/30 hover:text-red-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-dashed border-white/15 hover:border-white/30 text-white/40 hover:text-white/60 text-sm transition-colors">
                <Upload className="h-4 w-4" /> Click to upload PDF
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
          </div>

          {!pdfFile && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-[10px] font-mono text-white/25">OR</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Paste Resume Text</label>
                <textarea rows={10} placeholder="Paste your full resume here…"
                  value={resumeText} onChange={e => setResumeText(e.target.value)} className="resize-none" />
              </div>
            </>
          )}

          <button onClick={() => analyzeMutation.mutate()} disabled={!canSubmit}
            className="w-full h-10 bg-primary hover:bg-red-600 text-white font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {analyzeMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><FileSearch className="h-4 w-4" /> Analyze Resume</>}
          </button>
        </div>

        {report ? (
          <div className="flex flex-col gap-4">
            <div className="bg-[#111] border border-white/8 p-6 flex items-center gap-6">
              <ScoreGauge score={report.atsScore} />
              <div>
                <p className="font-bold text-lg">{report.verdict}</p>
                {report.targetRole && <p className="text-sm text-white/35 mt-1">For: {report.targetRole}</p>}
              </div>
            </div>
            <div className="bg-[#111] border border-white/8 p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">Section Scores</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(report.sections || {}).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-white/40 w-24 capitalize">{key}</span>
                    <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${val.score >= 7 ? "bg-green-400" : val.score >= 5 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${val.score * 10}%` }} />
                    </div>
                    <span className="text-xs font-mono text-white/50 w-6">{val.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] border border-white/8 p-4">
                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Missing Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {report.missingKeywords?.map(k => (
                    <span key={k} className="text-[11px] px-2 py-0.5 bg-red-400/8 border border-red-400/15 text-red-400">{k}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[#111] border border-white/8 p-4">
                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Strong Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {report.strongKeywords?.map(k => (
                    <span key={k} className="text-[11px] px-2 py-0.5 bg-green-400/8 border border-green-400/15 text-green-400">{k}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-[#111] border border-white/8 p-5">
              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">Improvements</p>
              <ul className="space-y-2">
                {report.improvements?.map((imp, i) => (
                  <li key={i} className="text-sm text-white/55 flex gap-2">
                    <span className="text-primary shrink-0 mt-0.5">›</span>{imp}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => { setActiveReport(null); removePdf(); setResumeText(""); }}
              className="text-sm text-white/30 hover:text-white transition-colors">
              Analyze another resume
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-[#111] border border-white/8 p-6 mb-4">
              <h3 className="font-bold text-sm mb-3">Past Reports</h3>
              {reportsData?.reports?.length ? (
                <div className="flex flex-col gap-2">
                  {reportsData.reports.slice(0, 5).map(r => (
                    <button key={r._id} onClick={() => api.get(`/resume/reports/${r._id}`).then(d => setActiveReport(d.data.report))}
                      className="flex items-center justify-between px-3 py-2 bg-white/[0.02] hover:bg-white/5 border border-white/6 transition-colors text-left">
                      <span className="text-sm text-white/70">{r.targetRole || "General"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-primary">{r.atsScore}%</span>
                        <ChevronRight className="h-3.5 w-3.5 text-white/20" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/25 font-mono">No reports yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}