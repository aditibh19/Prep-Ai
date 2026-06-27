import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  ArrowRight,
  ChevronRight,
  Mic,
  BarChart2,
  FileSearch,
  Building2,
  Loader2,
  X,
} from "lucide-react";

function AuthModal({ initialMode, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-white/10 bg-[#0D0D0D] p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-0 mb-8 border border-white/8">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mode === m
                  ? "bg-primary text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-white/30 uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
          )}
          <div>
            <label className="block text-[11px] font-mono tracking-widest text-white/30 uppercase mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono tracking-widest text-white/30 uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              minLength={6}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-11 bg-primary hover:bg-red-600 text-white font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Sign In" : "Create Account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/20 font-mono">
          MERN Stack · MongoDB · Express · React · Node.js
        </p>
      </div>
    </div>
  );
}

export default function Landing() {
  const [authMode, setAuthMode] = useState(null); // null | "login" | "register"

  const openLogin = () => setAuthMode("login");
  const openRegister = () => setAuthMode("register");
  const closeAuth = () => setAuthMode(null);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 md:px-16 h-16 border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-primary">&gt;_</span>
          <span>PrepAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openLogin}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Login
          </button>
          <button
            onClick={openRegister}
            className="bg-white text-black hover:bg-white/90 font-semibold text-sm px-5 h-9 rounded-sm transition-colors"
          >
            Get Started
          </button>
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
              Crack tech
              <br />
              placements with
              <br />
              <span className="text-primary">adaptive AI.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-md">
              One platform. DSA tracker, ATS resume analysis, AI mock
              interviews with cross-questioning, company-specific roadmaps,
              and analytics — all powered by Gemini.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <button
                onClick={openRegister}
                className="bg-primary hover:bg-red-600 text-white font-semibold px-8 h-12 rounded-sm text-base transition-colors flex items-center"
              >
                Start Preparing <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={openLogin}
                className="border border-white/10 text-white/70 hover:text-white hover:bg-white/5 h-12 px-6 rounded-sm text-base bg-transparent transition-colors"
              >
                I have an account
              </button>
            </div>
          </div>

          {/* Right — Stats */}
          <div className="flex flex-col gap-0 divide-y divide-white/5 border border-white/5">
            {[
              { label: "DSA Problems Tracked", value: "∞" },
              { label: "AI Interview Turns", value: "adaptive" },
              { label: "Companies Covered", value: "10+" },
              { label: "ATS Reports / Day", value: "unlimited" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="px-8 py-6 flex items-center justify-between"
              >
                <span className="text-[11px] font-mono tracking-[0.18em] text-white/35 uppercase">
                  {stat.label}
                </span>
                <span className="text-xl font-bold text-white">
                  {stat.value}
                </span>
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
                <div
                  key={f.title}
                  className="bg-[#080808] p-8 flex flex-col gap-4 group hover:bg-white/[0.02] transition-colors"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {f.desc}
                  </p>
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
          <button
            onClick={openRegister}
            className="bg-primary hover:bg-red-600 text-white font-semibold px-10 h-14 rounded-sm text-lg shrink-0 transition-colors flex items-center"
          >
            Begin Prep <ChevronRight className="ml-1 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 md:px-16 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-white/30">
          <span className="text-primary">&gt;_</span>
          <span>PrepAI</span>
        </div>
        <p className="text-xs text-white/20 font-mono">
          MERN Stack · MongoDB · Express · React · Node.js
        </p>
      </footer>

      {authMode && <AuthModal initialMode={authMode} onClose={closeAuth} />}
    </div>
  );
}