import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  LayoutDashboard, Code2, MessageSquare, FileText,
  Building2, GraduationCap, LineChart, User, Menu, X, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Core" },
  { href: "/dsa", label: "DSA Tracker", icon: Code2, group: "Core" },
  { href: "/interviews", label: "Interviews", icon: MessageSquare, group: "Core" },
  { href: "/resume", label: "Resume", icon: FileText, group: "Core" },
  { href: "/companies", label: "Companies", icon: Building2, group: "Strategy" },
  { href: "/study-plans", label: "Study Plans", icon: GraduationCap, group: "Strategy" },
  { href: "/analytics", label: "Analytics", icon: LineChart, group: "Strategy" },
  { href: "/profile", label: "Profile", icon: User, group: "Strategy" },
];

export default function AppLayout({ children }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location]);

  const NavLink = ({ href, label, icon: Icon }) => {
    const active = location === href || (location.startsWith(href + "/") && href !== "/dashboard");
    return (
      <Link href={href}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
          active ? "text-white bg-white/8" : "text-white/40 hover:text-white/80 hover:bg-white/4"
        }`}>
        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
        {label}
      </Link>
    );
  };

  const Sidebar = () => {
    const coreItems = navItems.filter(i => i.group === "Core");
    const stratItems = navItems.filter(i => i.group === "Strategy");
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white">
            <span className="text-primary font-mono">&gt;_</span> PrepAI
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          <p className="text-[10px] font-mono tracking-[0.15em] text-white/20 uppercase px-3 mb-2">Core Prep</p>
          {coreItems.map(i => <NavLink key={i.href} {...i} />)}
          <p className="text-[10px] font-mono tracking-[0.15em] text-white/20 uppercase px-3 mb-2 mt-5">Strategy</p>
          {stratItems.map(i => <NavLink key={i.href} {...i} />)}
        </nav>
        <div className="px-3 py-4 border-t border-white/5 flex flex-col gap-0.5">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/30 hover:text-white/60 transition-colors rounded-sm w-full text-left">
            <LogOut className="h-4 w-4 shrink-0" /> Sign out
          </button>
          {user && (
            <div className="mt-2 px-3 py-2 border border-white/5 rounded-sm">
              <p className="text-xs text-white/40 truncate font-mono">{user.name}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-52 border-r border-white/5 bg-[#060606] flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 h-14 border-b border-white/5 bg-[#060606]">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
          <span className="text-primary font-mono">&gt;_</span> PrepAI
        </Link>
        <button onClick={() => setOpen(v => !v)} className="text-white/40 hover:text-white">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-52 bg-[#060606] border-r border-white/5 h-full"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <main className="p-5 md:p-8 pt-20 md:pt-8">{children}</main>
      </div>
    </div>
  );
}
