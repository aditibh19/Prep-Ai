import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";
import { toast } from "sonner";
import { Plus, Loader2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

export default function StudyPlans() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ title: "", targetRole: "Software Engineer", targetCompany: "", durationWeeks: 8 });

  const { data, isLoading } = useQuery({
    queryKey: ["study-plans"],
    queryFn: () => api.get("/study-plans").then(r => r.data),
  });

  const { data: planDetail } = useQuery({
    queryKey: ["study-plan", expanded],
    queryFn: () => api.get(`/study-plans/${expanded}`).then(r => r.data),
    enabled: !!expanded,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/study-plans", form),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ["study-plans"] });
      setShowCreate(false);
      setExpanded(data.plan._id);
      toast.success("Study plan created");
    },
    onError: e => toast.error(e.response?.data?.error || "Failed to create"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/study-plans/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["study-plans"] }); toast.success("Deleted"); },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">AI Generated</p>
          <h1 className="text-2xl font-bold">Study Plans</h1>
        </div>
        <button onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-2 px-4 h-9 bg-primary hover:bg-red-600 text-white text-sm font-semibold rounded-sm transition-colors">
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      {showCreate && (
        <div className="bg-[#111] border border-white/8 p-6 mb-6">
          <h3 className="font-bold mb-4">Create Study Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Plan Title *</label>
              <input placeholder="e.g. 8-Week Amazon Prep" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Target Role</label>
              <input value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Target Company</label>
              <input placeholder="Optional" value={form.targetCompany} onChange={e => setForm(f => ({ ...f, targetCompany: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Duration (weeks)</label>
              <select value={form.durationWeeks} onChange={e => setForm(f => ({ ...f, durationWeeks: +e.target.value }))}>
                {[4,6,8,10,12].map(w => <option key={w} value={w}>{w} weeks</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending}
              className="px-5 h-9 bg-primary hover:bg-red-600 text-white text-sm font-semibold rounded-sm disabled:opacity-50 flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {createMutation.isPending ? "Generating…" : "Generate Plan"}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-5 h-9 border border-white/10 text-white/50 text-sm rounded-sm">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
      ) : !data?.plans?.length ? (
        <div className="text-center py-16 border border-white/5 text-white/25 font-mono text-sm">No plans yet</div>
      ) : (
        <div className="flex flex-col gap-px bg-white/5 border border-white/5">
          {data.plans.map(plan => (
            <div key={plan._id}>
              <div className="bg-[#0D0D0D] px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{plan.title}</p>
                  <p className="text-xs text-white/30 font-mono mt-0.5">
                    {plan.targetRole}{plan.targetCompany ? ` · ${plan.targetCompany}` : ""} · {plan.durationWeeks}w
                  </p>
                </div>
                <button onClick={() => setExpanded(expanded === plan._id ? null : plan._id)}
                  className="text-white/30 hover:text-white transition-colors">
                  {expanded === plan._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button onClick={() => deleteMutation.mutate(plan._id)} className="text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {expanded === plan._id && planDetail?.plan?.weeks && (
                <div className="bg-[#0A0A0A] border-t border-white/5 px-5 py-4 grid grid-cols-1 gap-3">
                  {planDetail.plan.weeks.map((w) => (
                    <div key={w.week} className="border border-white/6 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-primary">Week {w.week}</span>
                        <span className="font-semibold text-sm">{w.theme}</span>
                      </div>
                      <ul className="space-y-1 mb-3">
                        {w.tasks?.map((t, i) => (
                          <li key={i} className="text-xs text-white/50 flex gap-2"><span className="text-primary/60">›</span>{t}</li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1.5">
                        {w.resources?.map(r => (
                          <span key={r} className="text-[10px] px-1.5 py-0.5 bg-white/4 border border-white/8 text-white/35">{r}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
