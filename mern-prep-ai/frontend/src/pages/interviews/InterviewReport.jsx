import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import api from "../../lib/api.js";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

const verdictConfig = {
  "Strong Hire": { color: "text-green-400", bg: "bg-green-400/8 border-green-400/20" },
  "Hire":        { color: "text-green-400", bg: "bg-green-400/8 border-green-400/20" },
  "Maybe":       { color: "text-yellow-400", bg: "bg-yellow-400/8 border-yellow-400/20" },
  "No Hire":     { color: "text-red-400",   bg: "bg-red-400/8 border-red-400/20" },
};

function ScoreBar({ label, value }) {
  const safe  = typeof value === "number" && !isNaN(value) ? value : 0;
  const color = safe >= 70 ? "bg-green-400" : safe >= 50 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/50">{label}</span>
        <span className="font-mono font-bold text-white">{safe}%</span>
      </div>
      <div className="h-1 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

export default function InterviewReport({ params }) {
  const { data, isLoading } = useQuery({
    queryKey: ["interview", params.id],
    queryFn: () => api.get(`/interviews/${params.id}`).then(r => r.data),
    // Poll every 2s until the report is generated, then stop
    refetchInterval: (query) => query.state.data?.session?.report ? false : 2000,
    refetchIntervalInBackground: false,
  });

  if (isLoading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const session = data?.session;
  const report  = session?.report;

  if (!session) return null;

  // Report not ready yet — show spinner while polling
  if (!report) return (
    <div className="max-w-2xl mx-auto text-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-white/50 text-sm font-medium">Generating your report…</p>
      <p className="text-white/25 text-xs mt-2 font-mono">This takes a few seconds</p>
    </div>
  );

  const vc = verdictConfig[report.verdict] ?? { color: "text-white/60", bg: "bg-white/4 border-white/10" };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/interviews" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> All Interviews
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">Interview Report</p>
          <h1 className="text-2xl font-bold">{session.role}</h1>
          <p className="text-sm text-white/35 font-mono mt-1">{session.difficulty} · {session.topic}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 border ${vc.bg}`}>
          <span className={`text-2xl font-bold ${vc.color}`}>{report.overallScore ?? "—"}%</span>
          <span className={`text-sm font-bold ${vc.color}`}>{report.verdict ?? "Pending"}</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="bg-[#111] border border-white/8 p-6 mb-6 flex flex-col gap-4">
        <h2 className="font-bold text-sm text-white/60 uppercase tracking-wider font-mono">Score Breakdown</h2>
        <ScoreBar label="Technical"       value={report.technicalScore} />
        <ScoreBar label="Communication"   value={report.communicationScore} />
        <ScoreBar label="Problem Solving" value={report.problemSolvingScore} />
      </div>

      {/* Strengths + Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111] border border-white/8 p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-4 w-4" /> Strengths
          </h3>
          {report.strengths?.length > 0 ? (
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="text-sm text-white/65 flex gap-2">
                  <span className="text-primary mt-0.5">›</span>{s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/25 italic">No strengths recorded.</p>
          )}
        </div>
        <div className="bg-[#111] border border-white/8 p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-yellow-400">
            <AlertCircle className="h-4 w-4" /> Improve
          </h3>
          {report.improvements?.length > 0 ? (
            <ul className="space-y-2">
              {report.improvements.map((s, i) => (
                <li key={i} className="text-sm text-white/65 flex gap-2">
                  <span className="text-primary mt-0.5">›</span>{s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/25 italic">No improvements recorded.</p>
          )}
        </div>
      </div>

      {/* Detailed feedback */}
      {report.detailedFeedback && (
        <div className="bg-[#111] border border-white/8 p-6 mb-6">
          <h3 className="font-bold text-sm mb-3 text-white/50 uppercase tracking-wider font-mono">Detailed Feedback</h3>
          <p className="text-sm text-white/65 leading-relaxed whitespace-pre-line">{report.detailedFeedback}</p>
        </div>
      )}

      {/* Per-answer scores */}
      <div className="bg-[#111] border border-white/8 p-6">
        <h3 className="font-bold text-sm mb-4 text-white/50 uppercase tracking-wider font-mono">Answer-by-Answer</h3>
        <div className="flex flex-col gap-3">
          {session.messages.filter(m => m.role === "user").map((m, i) => (
            <div key={i} className="border border-white/6 p-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-white/30 font-mono">Answer {i + 1}</span>
                {m.score != null && (
                  <span className={`text-xs font-bold font-mono ${m.score >= 7 ? "text-green-400" : m.score >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                    {m.score}/10
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 mb-2 line-clamp-2">{m.content}</p>
              {m.feedback && <p className="text-xs text-white/35 italic">{m.feedback}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link href="/interviews/new"
          className="flex-1 h-10 bg-primary hover:bg-red-600 text-white font-semibold rounded-sm transition-colors flex items-center justify-center text-sm">
          New Interview
        </Link>
        <Link href="/interviews"
          className="flex-1 h-10 border border-white/10 text-white/50 hover:text-white rounded-sm transition-colors flex items-center justify-center text-sm">
          All Interviews
        </Link>
      </div>
    </div>
  );
}