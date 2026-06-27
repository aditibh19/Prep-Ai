import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import api from "../lib/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Code2, MessageSquare, FileText, TrendingUp, ArrowRight, Loader2 } from "lucide-react";

function StatCard({ label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-[#111] border border-white/6 p-6">
      <p className="text-[10px] font-mono tracking-widest text-white/30 uppercase mb-3">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/35 mt-2">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.get("/analytics/overview").then(r => r.data),
  });

  const s = data?.summary;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-mono tracking-widest text-white/25 uppercase mb-1">Welcome back</p>
        <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading stats...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 mb-8">
            <StatCard label="DSA Solved" value={s?.solvedDsa ?? 0} sub={`of ${s?.totalDsa ?? 0} total`} color="text-primary" />
            <StatCard label="Interviews" value={s?.completedInterviews ?? 0} sub={`${s?.totalInterviews ?? 0} started`} />
            <StatCard label="Avg Score" value={s?.avgScore ? `${s.avgScore}%` : "—"} sub="Interview performance" />
            <StatCard label="Resumes" value={s?.totalResumes ?? 0} sub="ATS reports generated" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {[
              { href: "/dsa", icon: Code2, title: "DSA Tracker", desc: "Log and track problems by topic", cta: "Open Tracker" },
              { href: "/interviews/new", icon: MessageSquare, title: "Start Interview", desc: "AI mock interview with voice support", cta: "Begin Now", accent: true },
              { href: "/resume", icon: FileText, title: "Resume Analyzer", desc: "Get ATS score and improvement tips", cta: "Analyze" },
            ].map(({ href, icon: Icon, title, desc, cta, accent }) => (
              <Link key={href} href={href}
                className="bg-[#111] p-6 hover:bg-white/[0.03] transition-colors flex flex-col gap-4 group">
                <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-white/40"}`} />
                <div>
                  <p className="font-bold text-white">{title}</p>
                  <p className="text-sm text-white/35 mt-1">{desc}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-mono mt-auto ${accent ? "text-primary" : "text-white/30 group-hover:text-white/60"} transition-colors`}>
                  {cta} <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
