import { useState } from "react";
import { useStartInterview } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Terminal, BrainCircuit, ShieldAlert, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ROLES = [
  { id: "Frontend", name: "Frontend Engineer", icon: Terminal, desc: "React, DOM, Web Perf, CSS" },
  { id: "Backend", name: "Backend Engineer", icon: Cpu, desc: "Node, DB Design, System Design" },
  { id: "Java", name: "Java Developer", icon: BrainCircuit, desc: "OOP, Concurrency, Spring" },
  { id: "MERN", name: "MERN Stack", icon: Terminal, desc: "Mongo, Express, React, Node" },
  { id: "SDE", name: "SDE Generalist", icon: BrainCircuit, desc: "Algorithms, OS, Networks" },
  { id: "Full Stack", name: "Full Stack", icon: Cpu, desc: "End-to-end web architecture" }
];

const DIFFICULTIES = [
  { id: "Easy", name: "Easy", desc: "Basic concepts, definitions, direct problem solving" },
  { id: "Medium", name: "Medium", desc: "Real-world scenarios, trade-offs, standard patterns" },
  { id: "Hard", name: "Hard", desc: "System limits, deep dives, edge cases, intense cross-questioning" }
];

export default function StartInterviewPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState("Frontend");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");

  const startMutation = useStartInterview({
    mutation: {
      onSuccess: (session) => {
        queryClient.invalidateQueries({ queryKey: ["interviews"] });
        toast.success("Simulation initialized");
        setLocation(`/interviews/${session.id}`);
      },
      onError: () => {
        toast.error("Failed to start interview");
      }
    }
  });

  const handleStart = () => {
    startMutation.mutate({
      data: {
        role: selectedRole as any,
        difficulty: selectedDifficulty as any
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configure Interview</h1>
        <p className="text-muted-foreground">Setup parameters for your AI mock interview simulation.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-primary">1. Select Target Role</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(role => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]" 
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className={`font-bold ${isSelected ? "text-primary" : ""}`}>{role.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{role.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-primary mt-8">2. Select Difficulty Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DIFFICULTIES.map(diff => {
              const isSelected = selectedDifficulty === diff.id;
              let colorClass = "";
              if (isSelected) {
                if (diff.id === "Easy") colorClass = "border-green-500 bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                if (diff.id === "Medium") colorClass = "border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
                if (diff.id === "Hard") colorClass = "border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
              }

              return (
                <div 
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected ? colorClass : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <h3 className="font-bold mb-1">{diff.name}</h3>
                  <p className="text-xs opacity-80">{diff.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="pt-8 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
            <span>Simulation uses microphone to record your voice. Prepare a quiet environment.</span>
          </div>
          
          <Button 
            onClick={handleStart} 
            disabled={startMutation.isPending}
            size="lg"
            className="bg-primary text-primary-foreground font-bold text-lg px-8 rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
          >
            {startMutation.isPending ? "Initializing..." : "START SIMULATION"}
          </Button>
        </div>
      </div>
    </div>
  );
}
