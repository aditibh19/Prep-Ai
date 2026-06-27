import { useQuery } from "@tanstack/react-query";
import api from "../lib/api.js";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

const tooltipStyle = { backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "2px", fontSize: "12px" };

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.get("/analytics/overview").then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center gap-2 text-white/40 py-16"><Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...</div>
  );

  const s = data?.summary;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">Progress</p>
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 mb-8">
        {[
          { label: "DSA Solved", value: s?.solvedDsa ?? 0, total: s?.totalDsa },
          { label: "Interviews Done", value: s?.completedInterviews ?? 0, total: s?.totalInterviews },
          { label: "Avg Score", value: s?.avgScore ? `${s.avgScore}%` : "—" },
          { label: "Resumes Analyzed", value: s?.totalResumes ?? 0 },
        ].map(({ label, value, total }) => (
          <div key={label} className="bg-[#111] p-5">
            <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-2">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {total != null && <p className="text-xs text-white/30 mt-1 font-mono">of {total} total</p>}
          </div>
        ))}
      </div>

      {/* Score trend */}
      {data?.scoreTrend?.length > 0 && (
        <div className="bg-[#111] border border-white/8 p-6 mb-6">
          <h2 className="font-bold text-sm mb-4 text-white/50 uppercase tracking-wider font-mono">Interview Score Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="label" tick={{ fill: "#666", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#666", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="#EF2222" strokeWidth={2} dot={{ fill: "#EF2222", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* DSA by topic */}
      {data?.dsaByTopic?.length > 0 && (
        <div className="bg-[#111] border border-white/8 p-6">
          <h2 className="font-bold text-sm mb-4 text-white/50 uppercase tracking-wider font-mono">DSA by Topic</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dsaByTopic.map(d => ({ name: d._id, total: d.total, solved: d.solved }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 10 }} />
              <YAxis tick={{ fill: "#666", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total" fill="#1e1e1e" name="Total" />
              <Bar dataKey="solved" fill="#EF2222" name="Solved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
