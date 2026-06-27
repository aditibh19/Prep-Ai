import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, BarChart2, FileSearch, Building2, ChevronRight } from "lucide-react";

export default function LandingPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden dark">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 md:px-16 h-16 border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-primary">&gt;_</span>
          <span>PrepAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={login} className="text-white/50 hover:text-white text-sm">
            Login
          </Button>
          <Button
            onClick={login}
            className="bg-white text-black hover:bg-white/90 font-semibold text-sm px-5 rounded-sm"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 md:px-16 pt-20 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="text-[11px] font-mono tracking-[0.2em] text-white/40 uppercase mb-6">
              Your personal AI placement mentor
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.0] tracking-tight mb-6">
              Crack tech<br />
              placements with<br />
              <span className="text-primary">adaptive AI.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-md">
              One platform. DSA tracker, ATS resume analysis, AI mock interviews with cross-questioning,
              company-specific roadmaps, and analytics — all powered by Gemini.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Button
                onClick={login}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 rounded-sm text-base"
              >
                Start Preparing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={login}
                variant="outline"
                size="lg"
                className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 h-12 rounded-sm text-base bg-transparent"
              >
                I have an account
              </Button>
            </div>
          </div>

          {/* Right — Stats */}
          <div className="flex flex-col gap-0 divide-y divide-white/5 border border-white/5">
            {[
              { label: "DSA Problems Tracked", value: "\u221e" },
              { label: "AI Interview Turns", value: "adaptive" },
              { label: "Companies Covered", value: "10+" },
              { label: "ATS Reports / Day", value: "unlimited" },
            ].map((stat) => (
              <div key={stat.label} className="px-8 py-6 flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-[0.18em] text-white/35 uppercase">
                  {stat.label}
                </span>
                <span className="text-xl font-bold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 px-8 md:px-16 py-24">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-mono tracking-[0.2em] text-white/35 uppercase mb-12">
            Everything you need
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {[
              {
                icon: Mic,
                title: "AI Mock Interviews",
                desc: "Voice and text-based simulations with real-time cross-questioning and per-answer scoring.",
              },
              {
                icon: BarChart2,
                title: "DSA Analytics",
                desc: "Track solved problems by topic and difficulty. Streak calendar, weak-area detection.",
              },
              {
                icon: FileSearch,
                title: "Resume Analysis",
                desc: "ATS score, missing skills, and Gemini-powered improvement suggestions.",
              },
              {
                icon: Building2,
                title: "Company Roadmaps",
                desc: "Role-specific prep plans for Amazon, Google, Microsoft, and 9 more companies.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-[#080808] p-8 flex flex-col gap-4 group hover:bg-white/[0.02] transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 px-8 md:px-16 py-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <p className="text-[11px] font-mono tracking-[0.2em] text-white/35 uppercase mb-4">
              The interview never sleeps
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Neither should you.
            </h2>
          </div>
          <Button
            onClick={login}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-14 rounded-sm text-lg shrink-0"
          >
            Begin Prep <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 md:px-16 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-white/30">
          <span className="text-primary">&gt;_</span>
          <span>PrepAI</span>
        </div>
        <p className="text-xs text-white/20 font-mono">v2.0 / production</p>
      </footer>
    </div>
  );
}
