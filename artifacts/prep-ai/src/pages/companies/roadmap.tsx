import { useState, useEffect, useRef } from "react";
import { useGenerateCompanyRoadmap } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Map, 
  Target, 
  Clock, 
  HelpCircle,
  CheckCircle2,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompanyRoadmapPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  
  // Since we only have a generate mutation, we call it on mount to get the data
  const generateMutation = useGenerateCompanyRoadmap();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      generateMutation.mutate({ id });
    }
  }, [id, generateMutation]);

  if (generateMutation.isPending && !generateMutation.data) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-primary font-mono text-sm animate-pulse">COMPILING INTEL...</p>
      </div>
    );
  }

  if (generateMutation.isError) {
    return <div className="p-8 text-center text-destructive">Failed to compile intel.</div>;
  }

  const roadmap = generateMutation.data;
  if (!roadmap) return null;

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/companies"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{roadmap.companyName}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Map className="h-4 w-4" /> Tactical Roadmap</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {roadmap.estimatedDays} Days Est.</span>
          </div>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="border border-primary/30 bg-primary/5 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Terminal className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-primary relative z-10">
          <Target className="h-5 w-5" /> Core Strategy
        </h2>
        <p className="text-foreground/90 leading-relaxed relative z-10">
          {roadmap.preparationStrategy}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frequent Topics */}
        <div className="border border-border bg-card rounded-lg p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> High-Probability Topics
          </h3>
          <ul className="space-y-3">
            {roadmap.frequentTopics.map((topic, i) => (
              <li key={i} className="flex gap-3 text-sm p-2 bg-secondary/50 rounded-md border border-border">
                <span className="font-mono text-muted-foreground">0{i+1}</span>
                <span className="font-medium text-foreground/90">{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sample Questions */}
        <div className="border border-border bg-card rounded-lg p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-blue-500" /> Known Interview Patterns
          </h3>
          <ul className="space-y-4">
            {roadmap.interviewQuestions.map((q, i) => (
              <li key={i} className="text-sm p-3 bg-secondary/50 rounded-md border border-border relative">
                <span className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-blue-500/20 rounded-full border border-blue-500" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-6 flex justify-center">
        <Button asChild size="lg" className="bg-primary text-primary-foreground font-bold px-8 rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all">
          <Link href={`/study-plans?company=${encodeURIComponent(roadmap.companyName)}`}>
            Generate Execution Plan
          </Link>
        </Button>
      </div>
    </div>
  );
}
