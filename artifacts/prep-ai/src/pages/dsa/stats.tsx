import { useGetDsaStats } from "@workspace/api-client-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { AlertCircle, TrendingUp, Target, BrainCircuit, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DsaStatsPage() {
  const { data: stats, isLoading } = useGetDsaStats({
    query: { queryKey: ["dsa-stats-detailed"] }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Computing analytics...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center text-destructive">Failed to load stats.</div>;
  }

  // Formatting data for charts
  const diffData = stats.byDifficulty.map(d => ({
    name: d.difficulty,
    value: d.count,
    solved: d.solved
  }));

  const COLORS = {
    Easy: "hsl(142 71% 45%)",
    Medium: "hsl(45 93% 47%)",
    Hard: "hsl(0 84% 60%)"
  };

  // Generate heatmap calendar data (simplified for this view using a bar chart of recent streak)
  const streakData = stats.weeklyStreak.map(day => ({
    date: format(parseISO(day.date), "MMM dd"),
    count: day.count
  }));

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">DSA Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your problem-solving metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <p className="text-sm font-medium text-muted-foreground">Total Solved</p>
            <p className="text-3xl font-bold font-mono text-primary">{stats.solved}</p>
          </div>
          <Progress value={stats.total ? (stats.solved / stats.total) * 100 : 0} className="h-1 bg-secondary" />
        </div>
        
        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <p className="text-sm font-medium text-muted-foreground">Hard Problems</p>
            <p className="text-3xl font-bold font-mono text-red-500">
              {stats.byDifficulty.find(d => d.difficulty === "Hard")?.solved || 0}
            </p>
          </div>
          <div className="text-xs text-muted-foreground">Highest weightage for interviews</div>
        </div>

        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <p className="text-sm font-medium text-muted-foreground">Needs Revision</p>
            <p className="text-3xl font-bold font-mono text-blue-500">{stats.revision}</p>
          </div>
          <div className="text-xs text-muted-foreground">Problems marked for review</div>
        </div>

        <div className="p-5 border border-border bg-card rounded-lg flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <p className="text-sm font-medium text-muted-foreground">Topics Explored</p>
            <p className="text-3xl font-bold font-mono text-purple-500">{stats.byTopic.length}</p>
          </div>
          <div className="text-xs text-muted-foreground">Breadth of knowledge</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Breakdown */}
        <div className="border border-border bg-card rounded-lg p-5">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Difficulty Breakdown
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diffData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="solved"
                    stroke="none"
                  >
                    {diffData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "hsl(var(--primary))"} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No data to display</p>
            )}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="border border-border bg-card rounded-lg p-5">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Top Topics
          </h2>
          <div className="h-[300px]">
            {stats.byTopic.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byTopic.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--foreground))" }} />
                  <RechartsTooltip 
                    cursor={{ fill: "hsl(var(--secondary))" }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Bar dataKey="solved" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No topics explored yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Velocity */}
        <div className="lg:col-span-2 border border-border bg-card rounded-lg p-5">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Solving Velocity (Last 7 Days)
          </h2>
          <div className="h-[250px]">
            {streakData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: "hsl(var(--secondary))" }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Bar dataKey="count" name="Problems Solved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No activity in the last 7 days</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
