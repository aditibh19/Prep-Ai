import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/api.js";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    targetRole: user?.targetRole ?? "",
    targetCompany: user?.targetCompany ?? "",
    experienceLevel: user?.experienceLevel ?? "fresher",
    college: user?.college ?? "",
    bio: user?.bio ?? "",
  });

  const mutation = useMutation({
    mutationFn: () => api.patch("/auth/profile", form),
    onSuccess: ({ data }) => { updateUser(data.user); toast.success("Profile updated"); },
    onError: e => toast.error(e.response?.data?.error || "Update failed"),
  });

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fields = [
    { k: "name", label: "Full Name", type: "text", placeholder: "Your name" },
    { k: "targetRole", label: "Target Role", type: "text", placeholder: "e.g. Software Engineer" },
    { k: "targetCompany", label: "Dream Company", type: "text", placeholder: "e.g. Google" },
    { k: "college", label: "College / University", type: "text", placeholder: "e.g. IIT Delhi" },
  ];

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-mono tracking-widest text-white/25 uppercase mb-1">Account</p>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="bg-[#111] border border-white/8 p-6 flex flex-col gap-5">
        {fields.map(({ k, label, type, placeholder }) => (
          <div key={k}>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">{label}</label>
            <input type={type} placeholder={placeholder} value={form[k]} onChange={e => F(k, e.target.value)} />
          </div>
        ))}

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Experience Level</label>
          <select value={form.experienceLevel} onChange={e => F("experienceLevel", e.target.value)}>
            <option value="fresher">Fresher</option>
            <option value="1-2 years">1–2 Years</option>
            <option value="3-5 years">3–5 Years</option>
            <option value="5+ years">5+ Years</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Bio</label>
          <textarea rows={3} placeholder="Tell us about yourself…" value={form.bio}
            onChange={e => F("bio", e.target.value)} className="resize-none" />
        </div>

        <div className="pt-1 border-t border-white/5">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Email</label>
          <p className="text-sm text-white/40 font-mono">{user?.email}</p>
        </div>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
          className="w-full h-10 bg-primary hover:bg-red-600 text-white font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
