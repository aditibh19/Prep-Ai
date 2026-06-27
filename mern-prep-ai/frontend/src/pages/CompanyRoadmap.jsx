import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import api from "../lib/api.js";
import { ArrowLeft, Loader2, Zap } from "lucide-react";

const COMPANIES_META = {
  amazon: { name: "Amazon", logo: "🟠" }, google: { name: "Google", logo: "🔵" },
  microsoft: { name: "Microsoft", logo: "🟦" }, meta: { name: "Meta", logo: "🔵" },
  adobe: { name: "Adobe", logo: "🔴" }, flipkart: { name: "Flipkart", logo: "🟡" },
  atlassian: { name: "Atlassian", logo: "🔷" }, goldman: { name: "Goldman Sachs", logo: "⬜" },
  uber: { name: "Uber", logo: "⬛" }, walmart: { name: "Walmart Labs", logo: "🟦" },
  infosys: { name: "Infosys", logo: "🟤" }, tcs: { name: "TCS", logo: "🔵" },
};

export default function CompanyRoadmap({ params }) {
  const meta = COMPANIES_META[params.id] ?? { name: params.id, logo: "🏢" };
  const [role, setRole] = useState("Software Engineer");
  const [expLevel, setExpLevel] = useState("fresher");
  const [roadmap, setRoadmap] = useState(null);

  const mutation = useMutation({
    mutationFn: () => api.post(`/companies/${params.id}/roadmap`, { role, experienceLevel: expLevel }),
    onSuccess: ({ data }) => setRoadmap(data.roadmap),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/companies" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> All Companies
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">{meta.logo}</span>
        <div>
          <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">Interview Prep Roadmap</p>
          <h1 className="text-2xl font-bold">{meta.name}</h1>
        </div>
      </div>

      {!roadmap && (
        <div className="bg-[#111] border border-white/8 p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Target Role</label>
              <input value={role} onChange={e => setRole(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Experience Level</label>
              <select value={expLevel} onChange={e => setExpLevel(e.target.value)}>
                <option value="fresher">Fresher</option>
                <option value="1-2 years">1–2 Years</option>
                <option value="3-5 years">3–5 Years</option>
                <option value="5+ years">5+ Years</option>
              </select>
            </div>
          </div>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="w-full h-10 bg-primary hover:bg-red-600 text-white font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Zap className="h-4 w-4" /> Generate Roadmap</>}
          </button>
        </div>
      )}

      {roadmap && (
        <div className="flex flex-col gap-5">
          <div className="bg-[#111] border border-white/8 p-5">
            <p className="text-sm text-white/60 leading-relaxed">{roadmap.overview}</p>
          </div>

          {/* Phases */}
          <div className="bg-[#111] border border-white/8 p-5">
            <h3 className="font-bold text-sm mb-4 text-white/50 uppercase tracking-wider font-mono">{roadmap.totalWeeks}-Week Plan</h3>
            <div className="flex flex-col gap-4">
              {roadmap.phases?.map((phase, i) => (
                <div key={i} className="border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{phase.phase}</span>
                    <span className="text-xs font-mono text-white/30">{phase.weeks}</span>
                  </div>
                  <p className="text-xs text-white/45 mb-3">{phase.focus}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.topics?.map(t => (
                      <span key={t} className="text-[11px] px-2 py-0.5 bg-white/4 border border-white/8 text-white/55">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Rounds */}
          <div className="bg-[#111] border border-white/8 p-5">
            <h3 className="font-bold text-sm mb-4 text-white/50 uppercase tracking-wider font-mono">Interview Process</h3>
            <div className="flex flex-col gap-2">
              {roadmap.interviewRounds?.map((r, i) => (
                <div key={i} className="flex gap-3 p-3 border border-white/5">
                  <span className="text-xs font-mono text-primary w-6 shrink-0">{i+1}.</span>
                  <div>
                    <p className="font-semibold text-sm">{r.round} <span className="text-white/30 font-normal">· {r.duration}</span></p>
                    <p className="text-xs text-white/40 mt-0.5">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111] border border-white/8 p-5">
              <h3 className="font-bold text-sm mb-3 text-white/50 uppercase tracking-wider font-mono">Tips</h3>
              <ul className="space-y-2">
                {roadmap.tips?.map((t, i) => (
                  <li key={i} className="text-sm text-white/55 flex gap-2"><span className="text-primary">›</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="bg-[#111] border border-white/8 p-5">
              <h3 className="font-bold text-sm mb-3 text-white/50 uppercase tracking-wider font-mono">Resources</h3>
              <ul className="space-y-2">
                {roadmap.resources?.map((r, i) => (
                  <li key={i} className="text-sm text-white/55 flex gap-2"><span className="text-primary">›</span>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <button onClick={() => setRoadmap(null)} className="text-sm text-white/30 hover:text-white transition-colors">
            Regenerate for different role
          </button>
        </div>
      )}
    </div>
  );
}
