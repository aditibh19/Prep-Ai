import { useState } from "react";
import { useAnalyzeResume, useListResumeReports } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { 
  FileText, 
  Upload, 
  ChevronRight, 
  Clock, 
  ShieldAlert,
  Loader2,
  FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export default function ResumeAnalyzerPage() {
  const [, setLocation] = useLocation();
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");

  const { data: reports, isLoading: isReportsLoading, refetch } = useListResumeReports({
    query: { queryKey: ["resume-reports"] }
  });

  const analyzeMutation = useAnalyzeResume({
    mutation: {
      onSuccess: (report) => {
        toast.success("Analysis complete");
        refetch();
        setLocation(`/resume/${report.id}`);
      },
      onError: () => {
        toast.error("Failed to analyze resume");
      }
    }
  });

  const handleAnalyze = () => {
    if (!fileName.trim()) {
      toast.error("Please provide a file name identifier");
      return;
    }
    if (!resumeText.trim() || resumeText.length < 50) {
      toast.error("Please provide valid resume content (min 50 chars)");
      return;
    }

    analyzeMutation.mutate({
      data: { fileName, resumeText }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 border-green-500/20 bg-green-500/10";
    if (score >= 60) return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
    return "text-red-500 border-red-500/20 bg-red-500/10";
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Scanner</h1>
        <p className="text-muted-foreground">ATS compatibility check and skill gap analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Form */}
        <div className="space-y-6">
          <div className="border border-border bg-card rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
              <FileSearch className="h-5 w-5" />
              New Scan
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Document Name</label>
                <Input 
                  placeholder="e.g. SDE_Resume_v2.pdf" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="bg-background"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="text-sm font-medium">Resume Content</label>
                  <span className="text-xs text-muted-foreground">Paste raw text</span>
                </div>
                <Textarea 
                  placeholder="Paste your resume text here..." 
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm bg-background resize-y"
                />
              </div>

              <div className="p-3 bg-secondary/50 rounded-md border border-border flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  The AI analyzes semantic meaning, keywords, and structural clarity. Visual formatting is ignored. Ensure all text from PDF/Word converts cleanly.
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={analyzeMutation.isPending}
                className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
              >
                {analyzeMutation.isPending ? (
                  <>Processing <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  <>Run Analysis <Upload className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Past Scans</h2>
          
          <div className="space-y-3">
            {isReportsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-20 border border-border bg-card rounded-lg animate-pulse"></div>
              ))
            ) : reports && reports.length > 0 ? (
              reports.map((report) => (
                <Link 
                  key={report.id} 
                  href={`/resume/${report.id}`}
                  className="block p-4 border border-border bg-card rounded-lg hover:border-primary/50 transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{report.fileName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(report.createdAt), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2.5 py-1 rounded font-mono font-bold text-sm border ${getScoreColor(report.atsScore)}`}>
                        {report.atsScore}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-lg bg-card/50">
                <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No resumes analyzed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
