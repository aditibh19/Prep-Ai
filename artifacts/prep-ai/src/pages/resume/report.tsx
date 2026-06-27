import { useGetResumeReport } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Briefcase,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumeReportPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const { data: report, isLoading, error } = useGetResumeReport(id, {
    query: {
      queryKey: ["resume-report", id]
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading report...</div>;
  }

  if (error || !report) {
    return <div className="p-8 text-center text-destructive">Report not found.</div>;
  }

  // Calculate rotation for SVG ring based on score
  const scorePercent = report.atsScore;
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 stroke-green-500";
    if (score >= 60) return "text-yellow-500 stroke-yellow-500";
    return "text-red-500 stroke-red-500";
  };

  return (
    <div className="space-y-8 pb-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/resume"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">{report.fileName}</h1>
          <p className="text-muted-foreground">Diagnostic Report</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Score Ring */}
        <div className="col-span-1 border border-border bg-card rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pattern-grid-lg"></div>
          
          <div className="relative z-10 w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                className={getScoreColor(report.atsScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold font-mono ${getScoreColor(report.atsScore).split(" ")[0]}`}>
                {report.atsScore}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">ATS Match</span>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6 z-10">
            {report.atsScore >= 80 ? "Highly competitive format and keyword density." : 
             report.atsScore >= 60 ? "Average match. Specific keywords missing." : 
             "Low match. Likely to be filtered by ATS."}
          </p>
        </div>

        {/* Missing Skills */}
        <div className="col-span-1 md:col-span-2 border border-border bg-card rounded-lg p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-yellow-500">
            <Target className="h-5 w-5" /> Missing High-Value Skills
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Based on current industry trends for engineering roles, your resume lacks these keywords:
          </p>
          <div className="flex flex-wrap gap-2">
            {report.missingSkills.length > 0 ? report.missingSkills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md text-sm font-medium">
                {skill}
              </span>
            )) : (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Comprehensive skill coverage detected.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Structural Improvements */}
        <div className="border border-border bg-card rounded-lg p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
            <AlertTriangle className="h-5 w-5" /> Required Improvements
          </h3>
          <ul className="space-y-4">
            {report.improvements.map((imp, i) => (
              <li key={i} className="flex gap-3 text-sm p-3 bg-secondary/50 rounded-md border border-border">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-foreground/90 leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Project Feedback */}
        <div className="border border-border bg-card rounded-lg p-6 flex flex-col">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
            <Briefcase className="h-5 w-5" /> Project Impact Analysis
          </h3>
          <div className="text-sm text-foreground/90 leading-relaxed bg-secondary/50 rounded-md p-4 border border-border flex-1">
            {report.projectsFeedback}
          </div>
        </div>
      </div>

      {/* Likely Interview Questions */}
      <div className="border border-border bg-card rounded-lg p-6">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
          <HelpCircle className="h-5 w-5" /> Anticipated Interview Questions
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Based on the claims in your resume, interviewers are likely to ask these cross-questions to verify depth:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.interviewQuestions.map((q, i) => (
            <div key={i} className="p-4 border border-border rounded-md bg-secondary/30 relative">
              <span className="absolute top-2 right-2 text-xs font-mono text-muted-foreground/50">Q{i+1}</span>
              <p className="text-sm font-medium pr-6">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
