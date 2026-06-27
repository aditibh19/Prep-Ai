import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import api from "../../lib/api.js";
import { Plus, MessageSquare, Loader2, ChevronRight, AlertCircle } from "lucide-react";

const VERDICT_COLOR = {
  "Strong Hire": "text-green-400",
  "Hire": "text-green-400",
  "Maybe": "text-yellow-400",
  "No Hire": "text-red-400",
};

function SessionRow({ s }) {
  const href = s.status === "active"
    ? `/interviews/${s._id}/live`
    : `/interviews/${s._id}/report`;

  const formattedDate = new Date(s.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={href}
      className="bg-[#0D0D0D] px-5 py-4 hover:bg-white/[0.02] transition-colors flex items-center gap-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{s.role}</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 border ${
              s.status === "active"
                ? "border-primary/30 text-primary bg-primary/8"
                : "border-white/10 text-white/30 bg-white/4"
            }`}
          >
            {s.status.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-white/30 mt-1 font-mono">
          {s.difficulty} · {s.topic} · {s.questionCount ?? 0} questions · {formattedDate}
        </p>
      </div>

      {(s.report?.verdict || s.report?.overallScore != null) && (
        <div className="text-right shrink-0">
          {s.report?.verdict && (
            <div className={`text-xs font-bold ${VERDICT_COLOR[s.report.verdict] ?? "text-white/40"}`}>
              {s.report.verdict}
            </div>
          )}
          {s.report?.overallScore != null && (
            <div className="text-sm font-bold text-white">{s.report.overallScore}%</div>
          )}
        </div>
      )}

      <ChevronRight className="h-4 w-4 text-white/20 shrink-0" />
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 border border-white/5">
      <MessageSquare className="h-8 w-8 text-white/15 mx-auto mb-3" />
      <p className="text-white/30 font-mono text-sm">No interviews yet</p>
      <Link
        href="/interviews/new"
        className="inline-flex items-center gap-1 mt-4 text-primary text-sm hover:underline"
      >
        Start your first interview <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex items-center gap-3 py-6 px-5 border border-red-500/20 bg-red-500/5 text-red-400">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p className="text-sm">{message ?? "Failed to load interviews. Please try again."}</p>
    </div>
  );
}

export default function InterviewList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.get("/interviews").then((r) => r.data),
  });

  const sessions = data?.sessions ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">
            AI Powered
          </p>
          <h1 className="text-2xl font-bold">Mock Interviews</h1>
        </div>
        <Link
          href="/interviews/new"
          className="flex items-center gap-2 px-4 h-9 bg-primary hover:bg-red-600 text-white text-sm font-semibold rounded-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> New Interview
        </Link>
      </div>

      {/* Voice mode banner */}
      <div className="bg-[#111] border border-primary/20 p-5 mb-8 flex items-start gap-3">
        <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm mb-1">Voice Mode Available</p>
          <p className="text-sm text-white/45">
            Tap the mic icon during any interview to speak your answers. The AI interviewer
            will also speak questions aloud via text-to-speech.
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : isError ? (
        <ErrorState message={error?.message} />
      ) : !sessions.length ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-px bg-white/5 border border-white/5">
          {sessions.map((s) => (
            <SessionRow key={s._id} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}