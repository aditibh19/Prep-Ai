import { useAuth } from "@workspace/replit-auth-web";
import { LogOut, MonitorSmartphone, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h2 className="font-bold flex items-center gap-2 text-foreground">
              <MonitorSmartphone className="h-5 w-5 text-primary" /> Appearance & Interface
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              PrepAI enforces a high-contrast dark mode to reduce eye strain during extended preparation sessions. Light mode is intentionally disabled to maintain the devtool aesthetic.
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono">
              Theme: Dark-Only (Forced)
            </div>
          </div>
        </div>

        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h2 className="font-bold flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              Notification settings are managed via your operating system. System alerts will only trigger for active interview sessions and scheduled roadmap milestones.
            </p>
          </div>
        </div>

        <div className="border border-destructive/30 bg-destructive/5 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-destructive/20 bg-destructive/10">
            <h2 className="font-bold flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" /> Session Management
            </h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sign Out</p>
              <p className="text-sm text-muted-foreground mt-1">End your current session and return to the login screen.</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={logout}
              className="rounded-none shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
            >
              <LogOut className="mr-2 h-4 w-4" /> Terminate Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
