import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import {
  LayoutDashboard,
  Code2,
  BarChart3,
  MessageSquare,
  FileText,
  Building2,
  GraduationCap,
  LineChart,
  User,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dsa", label: "DSA Tracker", icon: Code2 },
    { href: "/dsa/stats", label: "DSA Analytics", icon: BarChart3 },
    { href: "/interviews", label: "Interviews", icon: MessageSquare },
    { href: "/resume", label: "Resume", icon: FileText },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/study-plans", label: "Study Plans", icon: GraduationCap },
    { href: "/analytics", label: "Analytics", icon: LineChart },
  ];

  const bottomNavItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = location === href || (location.startsWith(href + "/") && href !== "/dashboard");
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-sm ${
          isActive
            ? "text-white bg-white/6"
            : "text-white/40 hover:text-white/80 hover:bg-white/4"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
        {label}
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
          <span className="text-primary">&gt;_</span>
          PrepAI
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[10px] font-mono tracking-[0.15em] text-white/20 uppercase px-3 mb-2 mt-1">Core Prep</p>
        {navItems.slice(0, 4).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <p className="text-[10px] font-mono tracking-[0.15em] text-white/20 uppercase px-3 mb-2 mt-5">Strategy</p>
        {navItems.slice(4).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>

      {/* User + bottom */}
      <div className="px-3 py-3 border-t border-white/5 flex flex-col gap-0.5">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/30 hover:text-white/60 transition-colors rounded-sm w-full text-left mt-1"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
        {user && (
          <div className="mt-3 px-3 py-2 border border-white/5 rounded-sm">
            <p className="text-xs font-medium text-white/60 truncate">
              {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.email ?? "User"}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row dark">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 h-14 border-b border-white/5 bg-[#060606]">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base text-white">
          <span className="text-primary">&gt;_</span>
          PrepAI
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white/50 hover:text-white">
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar — desktop */}
      <div className="hidden md:flex flex-col w-56 border-r border-white/5 bg-[#060606] flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Sidebar — mobile overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-[#060606] border-r border-white/5 flex flex-col">
            <div className="px-5 py-5 flex items-center justify-between border-b border-white/5">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base text-white">
                <span className="text-primary">&gt;_</span>
                PrepAI
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white/40">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Sidebar />
            </div>
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
