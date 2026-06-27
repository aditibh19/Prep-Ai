import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  Activity, 
  BrainCircuit, 
  Code2, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useGetDashboardSummary({
    query: {
      queryKey: ["dashboard-summary"]
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-secondary rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary rounded-lg border border-border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-secondary rounded-lg border border-border"></div>
          <div className="h-80 bg-secondary rounded-lg border border-border"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded">Failed to load dashboard data.</div>;
  }

  if (!summary) return null;

  const totalDsa = summary.dsaSolved + summary.dsaPending + (summary.dsaRevision || 0);
  const dsaProgress = totalDsa > 0 ? (summary.dsaSolved / totalDsa) * 100 : 0;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground">Your placement preparation status at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-primary/20 hover:border-primary/50 text-primary">
            <Link href="/interviews/new">
              <MessageSquare className="mr-2 h-4 w-4" /> Mock Interview
            </Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all">
            <Link href="/dsa">
              <Code2 className="mr-2 h-4 w-4" /> Log Problem
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">DSA Problems Solved</p>
              <p className="text-3xl font-bold font-mono">{summary.dsaSolved}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <Code2 className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>{Math.round(dsaProgress)}% completion</span>
              <span className="text-muted-foreground">{summary.dsaPending} pending</span>
            </div>
            <Progress value={dsaProgress} className="h-1.5" />
          </div>
        </div>

        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avg. Interview Score</p>
              <p className="text-3xl font-bold font-mono">{summary.avgInterviewScore !== null ? summary.avgInterviewScore.toFixed(1) : '-'}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            {summary.upcomingInterviews > 0 ? (
              <span className="text-primary font-medium">{summary.upcomingInterviews} upcoming</span>
            ) : (
              <span>No interviews scheduled</span>
            )}
          </div>
        </div>

        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Resume ATS Score</p>
              <p className="text-3xl font-bold font-mono">{summary.resumeScore !== null ? summary.resumeScore : '-'}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-md text-green-500">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {summary.resumeScore !== null ? (
              <span className={summary.resumeScore >= 80 ? "text-green-500" : "text-yellow-500"}>
                {summary.resumeScore >= 80 ? "Good standing" : "Needs improvement"}
              </span>
            ) : "Analyze resume to get score"}
          </div>
        </div>

        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between group hover:border-destructive/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Weak Areas</p>
              <p className="text-3xl font-bold font-mono">{summary.weakTopics.length}</p>
            </div>
            <div className="p-2 bg-destructive/10 rounded-md text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {summary.weakTopics.length > 0 ? summary.weakTopics.join(", ") : "Keep solving to identify"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 border border-border bg-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Progress Velocity
            </h2>
          </div>
          <div className="h-[250px] w-full">
            {summary.weeklyProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.weeklyProgress} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--secondary))" }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} 
                  />
                  <Bar dataKey="problemsSolved" name="DSA Solved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="interviewsDone" name="Interviews" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-md">
                Not enough data for this week
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="border border-border bg-card rounded-lg p-5 flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Activity Log
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-3 relative pb-4">
                  {i !== summary.recentActivity.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border"></div>
                  )}
                  <div className="w-5 h-5 rounded-full bg-secondary border border-primary/30 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(activity.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No recent activity. Start prepping!
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary justify-between" asChild>
              <Link href="/analytics">
                View Full Analytics <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
