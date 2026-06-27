import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, CheckCircle2, Clock, Bookmark } from "lucide-react";

const TOPICS = ["Array","String","LinkedList","Tree","Graph","DP","Backtracking","Sorting","Searching","Math","Greedy","Stack","Queue","Heap","Trie","Other"];
const DIFFICULTIES = ["Easy","Medium","Hard"];
const STATUSES = ["todo","attempted","solved"];
const PLATFORMS = ["LeetCode","GeeksForGeeks","HackerRank","Codeforces","Other"];

const statusIcon = { solved: CheckCircle2, attempted: Clock, todo: Bookmark };
const statusColor = { solved: "text-green-400", attempted: "text-yellow-400", todo: "text-white/30" };
const diffColor = { Easy: "text-green-400", Medium: "text-yellow-400", Hard: "text-red-400" };

export default function DsaTracker() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ topic: "", difficulty: "", status: "", search: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", platform: "LeetCode", difficulty: "Medium", topic: "Array", status: "todo", notes: "", url: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["dsa", filters],
    queryFn: () => api.get("/dsa", { params: filters }).then(r => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (body) => api.post("/dsa", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dsa"] }); setShowAdd(false); toast.success("Problem added"); },
    onError: (e) => toast.error(e.response?.data?.error || "Failed to add"),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/dsa/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dsa"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/dsa/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dsa"] }); toast.success("Deleted"); },
  });

  const F = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">Practice</p>
          <h1 className="text-2xl font-bold">DSA Tracker</h1>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 h-9 bg-primary hover:bg-red-600 text-white text-sm font-semibold rounded-sm transition-colors">
          <Plus className="h-4 w-4" /> Add Problem
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#111] border border-white/8 p-6 mb-6">
          <h3 className="font-bold mb-4">New Problem</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Title *</label>
              <input placeholder="Two Sum" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            {[
              { k: "platform", opts: PLATFORMS },
              { k: "difficulty", opts: DIFFICULTIES },
              { k: "topic", opts: TOPICS },
              { k: "status", opts: STATUSES },
            ].map(({ k, opts }) => (
              <div key={k}>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">{k}</label>
                <select value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Problem URL</label>
              <input placeholder="https://leetcode.com/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Notes</label>
              <textarea rows={2} placeholder="Approach, complexity notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.title || addMutation.isPending}
              className="px-5 h-9 bg-primary hover:bg-red-600 text-white text-sm font-semibold rounded-sm disabled:opacity-50 flex items-center gap-2">
              {addMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 h-9 border border-white/10 text-white/50 hover:text-white text-sm rounded-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input placeholder="Search problems…" value={filters.search}
          onChange={e => F("search", e.target.value)}
          className="w-52" style={{ padding: "6px 12px" }} />
        {[
          { k: "topic", opts: ["", ...TOPICS], label: "All Topics" },
          { k: "difficulty", opts: ["", ...DIFFICULTIES], label: "All Difficulties" },
          { k: "status", opts: ["", ...STATUSES], label: "All Status" },
        ].map(({ k, opts, label }) => (
          <select key={k} value={filters[k]} onChange={e => F(k, e.target.value)} style={{ width: "auto", padding: "6px 12px" }}>
            <option value="">{label}</option>
            {opts.slice(1).map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40 py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
      ) : (
        <div className="border border-white/6 divide-y divide-white/5">
          {!data?.problems?.length && (
            <div className="text-center py-16 text-white/25 font-mono text-sm">No problems yet — add your first one</div>
          )}
          {data?.problems?.map((p) => {
            const StatusIcon = statusIcon[p.status];
            return (
              <div key={p._id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] group">
                <button onClick={() => {
                  const next = p.status === "todo" ? "attempted" : p.status === "attempted" ? "solved" : "todo";
                  patchMutation.mutate({ id: p._id, data: { status: next } });
                }}>
                  <StatusIcon className={`h-4 w-4 ${statusColor[p.status]} hover:scale-110 transition-transform`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer"
                        className="font-medium text-sm text-white hover:text-primary transition-colors">{p.title}</a>
                    ) : (
                      <span className="font-medium text-sm text-white">{p.title}</span>
                    )}
                    <span className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 text-white/35">{p.platform}</span>
                  </div>
                  {p.notes && <p className="text-xs text-white/30 mt-0.5 truncate">{p.notes}</p>}
                </div>
                <span className="text-[10px] font-mono text-white/30 hidden sm:block">{p.topic}</span>
                <span className={`text-xs font-mono font-bold ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                <button onClick={() => deleteMutation.mutate(p._id)}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
