import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import api from "../../lib/api.js";
import { Mic, Loader2, Play } from "lucide-react";

const ROLES = ["Software Engineer","Frontend Developer","Backend Developer","Full Stack Developer","Data Scientist","ML Engineer","DevOps Engineer","System Design","Product Manager"];
const TOPICS = ["General","Data Structures","Algorithms","System Design","Database","Operating Systems","Computer Networks","OOP","JavaScript","Python","React","Node.js"];
const DIFFICULTIES = ["Easy","Medium","Hard"];

export default function InterviewNew() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ role: "Software Engineer", difficulty: "Medium", topic: "General" });

  const mutation = useMutation({
    mutationFn: () => api.post("/interviews/start", form),
    onSuccess: ({ data }) => setLocation(`/interviews/${data.session._id}/live`),
  });

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">Configure</p>
        <h1 className="text-2xl font-bold">New Interview</h1>
      </div>

      <div className="bg-[#111] border border-white/8 p-6 mb-6 flex items-start gap-3">
        <Mic className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm mb-1">Voice Mode Available</p>
          <p className="text-sm text-white/45">
            During the interview, toggle the microphone to speak your answers instead of typing.
            The AI will also read questions aloud. Works best in Chrome/Edge.
          </p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/8 p-6 flex flex-col gap-5">
        {[
          { k: "role", label: "Target Role", opts: ROLES },
          { k: "topic", label: "Topic Focus", opts: TOPICS },
          { k: "difficulty", label: "Difficulty", opts: DIFFICULTIES },
        ].map(({ k, label, opts }) => (
          <div key={k}>
            <label className="block text-[10px] font-mono tracking-widest text-white/30 uppercase mb-2">{label}</label>
            <select value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full mt-2 h-12 bg-primary hover:bg-red-600 text-white font-bold rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Starting interview…</>
          ) : (
            <><Play className="h-4 w-4" /> Begin Interview</>
          )}
        </button>
      </div>
    </div>
  );
}
