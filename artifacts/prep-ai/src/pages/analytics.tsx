import { useGetAnalyticsOverview } from "@workspace/api-client-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line
} from "recharts";
import { format, parseISO } from "date-fns";
import { Activity, BrainCircuit, Target, Code2, LineChart as ChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useGetAnalyticsOverview({
    query: { queryKey: ["analytics-overview"] }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Aggregating telemetry...</div>;
  }

  if (!analytics) return <div className="p-8 text-center text-destructive">Failed to load analytics.</div>;

  // Formatting for charts
  const trendData = analytics.interviewScoreTrend.map(d => ({
    date: format(parseISO(d.date), "MMM dd"),
    score: d.score,
    role: d.role
  }));

  const dsaTopicData = analytics.dsaProgressByTopic.map(d => ({
    name: d.topic,
    solved: d.solved || 0,
    total: d.count
  }));

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Telemetry</h1>
        <p className="text-muted-foreground">Comprehensive performance metrics across all vectors.</p>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 border border-border bg-card rounded-lg flex justify-between items-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 to-transparent">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Simulations Run</p>
            <p className="text-4xl font-bold font-mono">{analytics.totalInterviews}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Target className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="p-5 border border-border bg-card rounded-lg flex justify-between items-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Global Avg Score</p>
            <p className="text-4xl font-bold font-mono text-blue-500">{analytics.avgScore ? analytics.avgScore.toFixed(1) : '-'}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <ChartIcon className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Score Trend */}
        <div className="border border-border bg-card rounded-lg p-5">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Interview Performance Trend
          </h2>
          <div className="h-[250px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--card))", strokeWidth: 2 }} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Insufficient simulation data</div>
            )}
          </div>
        </div>

        {/* Study Hours */}
        <div className="border border-border bg-card rounded-lg p-5">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Weekly Investment (Hours)
          </h2>
          <div className="h-[250px]">
            {analytics.weeklyStudyHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.weeklyStudyHours} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="hours" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No time logged</div>
            )}
          </div>
        </div>

        {/* DSA Topic Progress */}
        <div className="border border-border bg-card rounded-lg p-5 lg:col-span-2">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            DSA Domain Mastery
          </h2>
          <div className="h-[300px]">
            {dsaTopicData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dsaTopicData} margin={{ top: 5, right: 0, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} angle={-45} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--secondary))" }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Bar dataKey="solved" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="total" stackId="a" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No problem data</div>
            )}
          </div>
        </div>

        {/* Strengths Map */}
        <div className="border border-border bg-card rounded-lg p-5 lg:col-span-2">
          <h2 className="text-lg font-bold mb-6">Topic Strength Heatmap</h2>
          <div className="flex flex-wrap gap-3">
            {analytics.topicStrength.length > 0 ? (
              analytics.topicStrength.map((topic, i) => {
                let badgeClass = "bg-secondary text-foreground";
                if (topic.strength === "Strong") badgeClass = "bg-green-500/20 text-green-500 border-green-500/30";
                if (topic.strength === "Moderate") badgeClass = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
                if (topic.strength === "Weak") badgeClass = "bg-red-500/20 text-red-500 border-red-500/30";
                
                return (
                  <Badge key={i} variant="outline" className={`px-3 py-1.5 border ${badgeClass} font-medium`}>
                    {topic.topic}
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground text-sm">Compute engine requires more data to map strengths.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
