import { useListInterviews } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { 
  MessageSquare, 
  Plus, 
  Star, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InterviewsListPage() {
  const { data: interviews, isLoading } = useListInterviews({
    query: { queryKey: ["interviews"] }
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-green-500 border-green-500/20";
      case "Medium": return "text-yellow-500 border-yellow-500/20";
      case "Hard": return "text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">Mock interviews with AI to perfect your delivery.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all">
          <Link href="/interviews/new">
            <Plus className="mr-2 h-4 w-4" /> Start Interview
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 border border-border bg-card rounded-lg animate-pulse"></div>
          ))
        ) : interviews && interviews.length > 0 ? (
          interviews.map((session) => (
            <div key={session.id} className="border border-border bg-card rounded-lg p-5 flex flex-col hover:border-primary/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{session.role.replace("_", " ")} Role</h3>
                  <Badge variant="outline" className={`font-normal text-xs ${getDifficultyColor(session.difficulty)}`}>
                    {session.difficulty}
                  </Badge>
                </div>
                {session.status === "completed" && session.overallScore !== null ? (
                  <div className={`flex items-center gap-1 font-mono font-bold text-xl ${getScoreColor(session.overallScore ?? 0)}`}>
                    {session.overallScore}
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border animate-pulse">
                    Active
                  </Badge>
                )}
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center text-xs text-muted-foreground gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(parseISO(session.createdAt), "MMM dd, yyyy")}
                  </div>
                  {session.questionCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {session.questionCount} Qs
                    </div>
                  )}
                </div>
                
                {session.status === "completed" ? (
                  <Button asChild variant="outline" className="w-full justify-between group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                    <Link href={`/interviews/${session.id}/report`}>
                      View Report <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full justify-between bg-primary text-primary-foreground">
                    <Link href={`/interviews/${session.id}`}>
                      Resume Interview <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border border-border border-dashed bg-card/50 rounded-lg p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No interviews yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start your first mock interview to get baseline metrics on your technical communication and confidence.
            </p>
            <Button asChild className="bg-primary text-primary-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all">
              <Link href="/interviews/new">
                Initialize Simulation
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
