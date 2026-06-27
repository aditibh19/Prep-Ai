import { useGetInterviewReport } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart
} from "recharts";
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function InterviewReportPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [, setLocation] = useLocation();

  const { data: report, isLoading, error } = useGetInterviewReport(id, {
    query: {
      queryKey: ["interview-report", id]
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Generating post-action report...</div>;
  }

  if (error || !report) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-lg max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Report Not Available</h3>
        <p className="text-muted-foreground mb-6">The simulation may not have completed successfully or was too short to generate meaningful data.</p>
        <Button onClick={() => setLocation("/interviews")}>Back to Interviews</Button>
      </div>
    );
  }

  const radarData = [
    { subject: "Communication", A: report.communication, fullMark: 100 },
    { subject: "Confidence", A: report.confidence, fullMark: 100 },
    { subject: "Technical", A: report.technicalSkills, fullMark: 100 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-8 pb-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/interviews"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">After-Action Report</h1>
          <p className="text-muted-foreground">Detailed breakdown of your simulation performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="col-span-1 border border-border bg-card rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <TrophyIcon className={`h-16 w-16 mb-4 ${getScoreColor(report.overallScore)}`} />
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Overall Score</div>
          <div className={`text-6xl font-bold font-mono ${getScoreColor(report.overallScore)}`}>
            {report.overallScore}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {report.overallScore >= 80 ? "Hire recommendation." : 
             report.overallScore >= 60 ? "Strong candidate, needs polish." : 
             "Needs fundamental review before real interviews."}
          </div>
        </div>

        {/* Metrics Radar */}
        <div className="col-span-1 md:col-span-2 border border-border bg-card rounded-lg p-6">
          <h3 className="font-bold mb-4">Skill Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border bg-card rounded-lg p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm text-muted-foreground">Technical Depth</span>
            <span className="font-mono font-bold">{report.technicalSkills}/100</span>
          </div>
          <Progress value={report.technicalSkills} className={`h-2 [&>div]:${getScoreBg(report.technicalSkills)}`} />
        </div>
        <div className="border border-border bg-card rounded-lg p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm text-muted-foreground">Communication</span>
            <span className="font-mono font-bold">{report.communication}/100</span>
          </div>
          <Progress value={report.communication} className={`h-2 [&>div]:${getScoreBg(report.communication)}`} />
        </div>
        <div className="border border-border bg-card rounded-lg p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm text-muted-foreground">Confidence</span>
            <span className="font-mono font-bold">{report.confidence}/100</span>
          </div>
          <Progress value={report.confidence} className={`h-2 [&>div]:${getScoreBg(report.confidence)}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <div className="space-y-6">
          <div className="border border-border bg-card rounded-lg p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-green-500">
              <CheckCircle2 className="h-5 w-5" /> Demonstrated Strengths
            </h3>
            <ul className="space-y-3">
              {report.strongAreas.length > 0 ? report.strongAreas.map((area, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <span className="text-foreground/90">{area}</span>
                </li>
              )) : (
                <li className="text-muted-foreground text-sm">No specific strengths identified.</li>
              )}
            </ul>
          </div>

          <div className="border border-border bg-card rounded-lg p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-red-500">
              <AlertTriangle className="h-5 w-5" /> Critical Weaknesses
            </h3>
            <ul className="space-y-3">
              {report.weakAreas.length > 0 ? report.weakAreas.map((area, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span className="text-foreground/90">{area}</span>
                </li>
              )) : (
                <li className="text-muted-foreground text-sm">No critical weaknesses identified.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border border-border bg-card rounded-lg p-6 flex flex-col">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
            <Lightbulb className="h-5 w-5" /> Recommended Study Topics
          </h3>
          <p className="text-sm text-muted-foreground mb-6">Based on your performance, the AI engine suggests focusing your preparation on the following areas:</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {report.recommendedTopics.map((topic, i) => (
              <div key={i} className="px-3 py-1.5 rounded-md bg-secondary border border-border text-sm font-medium">
                {topic}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-border">
            <Button asChild className="w-full bg-primary text-primary-foreground">
              <Link href="/study-plans">
                Generate Study Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrophyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
