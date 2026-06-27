import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useState, useEffect } from "react";
import { 
  User, Building2, Terminal, Code, GraduationCap, Calendar, Save, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    skills: "",
    projects: "",
    targetCompany: "",
    targetRole: "",
    bio: "",
    college: "",
    graduationYear: ""
  });

  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: ["profile"] }
  });

  const updateMutation = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        setIsEditing(false);
      },
      onError: () => {
        toast.error("Failed to update profile");
      }
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        skills: profile.skills?.join(", ") || "",
        projects: profile.projects?.join("\n") || "",
        targetCompany: profile.targetCompany || "",
        targetRole: profile.targetRole || "",
        bio: profile.bio || "",
        college: profile.college || "",
        graduationYear: profile.graduationYear ? String(profile.graduationYear) : ""
      });
    }
  }, [profile]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading identity...</div>;
  if (!profile) return null;

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        projects: formData.projects.split("\n").map(p => p.trim()).filter(Boolean),
        targetCompany: formData.targetCompany,
        targetRole: formData.targetRole,
        bio: formData.bio,
        college: formData.college,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-secondary border border-border flex items-center justify-center text-2xl font-bold">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Avatar" className="w-full h-full rounded-lg object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user?.firstName} {user?.lastName}</h1>
            <p className="text-muted-foreground font-mono text-sm">{user?.email}</p>
          </div>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={updateMutation.isPending}
          className="bg-primary text-primary-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
        >
          {isEditing ? <><Save className="mr-2 h-4 w-4" /> Save Configuration</> : "Edit Configuration"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Objective */}
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Primary Objective
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Target Company</label>
                {isEditing ? (
                  <Input 
                    value={formData.targetCompany} 
                    onChange={e => setFormData({...formData, targetCompany: e.target.value})}
                    className="bg-background"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-foreground font-medium p-2 bg-secondary/50 rounded-md">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {profile.targetCompany || "Not set"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Target Role</label>
                {isEditing ? (
                  <Input 
                    value={formData.targetRole} 
                    onChange={e => setFormData({...formData, targetRole: e.target.value})}
                    className="bg-background"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-foreground font-medium p-2 bg-secondary/50 rounded-md">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    {profile.targetRole || "Not set"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              About
            </h2>
            {isEditing ? (
              <Textarea 
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="bg-background min-h-[100px]"
                placeholder="Brief intro..."
              />
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90">
                {profile.bio || "No bio provided."}
              </p>
            )}
          </div>

          {/* Projects */}
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Key Projects
            </h2>
            {isEditing ? (
              <div>
                <Textarea 
                  value={formData.projects}
                  onChange={e => setFormData({...formData, projects: e.target.value})}
                  className="bg-background min-h-[100px]"
                  placeholder="One project per line"
                />
                <p className="text-xs text-muted-foreground mt-2">Enter one project per line</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {profile.projects && profile.projects.length > 0 ? profile.projects.map((proj, i) => (
                  <li key={i} className="flex gap-2 text-sm items-center p-2 bg-secondary/30 rounded-md border border-border">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {proj}
                  </li>
                )) : <p className="text-sm text-muted-foreground">No projects listed.</p>}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Prep Status */}
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="font-bold mb-2">Readiness Index</h2>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold font-mono text-primary">{profile.preparationProgress}%</span>
            </div>
            <Progress value={profile.preparationProgress} className="h-2 bg-secondary" />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Based on completed interviews, DSA problems, and resume analysis score.
            </p>
          </div>

          {/* Education */}
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Education</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Institution</label>
                {isEditing ? (
                  <Input value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} className="h-8 text-sm bg-background" />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    {profile.college || "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Graduation Year</label>
                {isEditing ? (
                  <Input type="number" value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: e.target.value})} className="h-8 text-sm bg-background" />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-primary" />
                    {profile.graduationYear || "—"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Tech Stack</h2>
            {isEditing ? (
              <div>
                <Textarea 
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                  className="bg-background min-h-[100px] text-sm"
                  placeholder="React, Node, Python..."
                />
                <p className="text-xs text-muted-foreground mt-2">Comma separated</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-secondary border border-border rounded text-xs font-mono">
                    {skill}
                  </span>
                )) : <span className="text-sm text-muted-foreground">No skills listed.</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Temporary icon components that weren't imported
function Target(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  );
}
