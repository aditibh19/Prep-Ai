import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import api from "../lib/api.js";
import { ChevronRight, Loader2 } from "lucide-react";

const diffColor = { Easy: "text-green-400", Medium: "text-yellow-400", Hard: "text-red-400" };

export default function Companies() {
  const { data, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get("/companies").then(r => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">AI Roadmaps</p>
        <h1 className="text-2xl font-bold">Companies</h1>
        <p className="text-sm text-white/35 mt-1">Select a company to generate an AI-powered interview prep roadmap</p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {data?.companies?.map(c => (
            <Link key={c.id} href={`/companies/${c.id}`}
              className="bg-[#0D0D0D] p-6 hover:bg-white/[0.03] transition-colors flex flex-col gap-3 group">
              <div className="text-3xl">{c.logo}</div>
              <div>
                <p className="font-bold text-white">{c.name}</p>
                <p className="text-xs text-white/35 mt-0.5">{c.domain}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-xs font-mono font-bold ${diffColor[c.difficulty]}`}>{c.difficulty}</span>
                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
