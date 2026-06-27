import { useGetStudyPlan } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Flag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudyPlanDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const { data: plan, isLoading, error } = useGetStudyPlan(id, {
    query: { queryKey: ["study-plan", id] }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Decoding timeline...</div>;
  }

  if (error || !plan) {
    return <div className="p-8 text-center text-destructive">Plan not found.</div>;
  }

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/study-plans"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Operation: {plan.targetCompany}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {plan.daysLeft} Days Allocation</span>
            <span className="flex items-center gap-1"><Flag className="h-4 w-4" /> {plan.weeks.length} Phases</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {plan.weeks.map((week) => (
          <div key={week.week} className="flex gap-4 group">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-secondary border border-primary text-primary flex items-center justify-center font-bold font-mono text-sm z-10 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                W{week.week}
              </div>
              {week.week !== plan.weeks.length && (
                <div className="w-px h-full bg-border group-hover:bg-primary/50 transition-colors my-2" />
              )}
            </div>

            {/* Content Card */}
            <div className="flex-1 pb-8">
              <div className="border border-border bg-card rounded-lg p-5 hover:border-primary/30 transition-colors">
                <h3 className="font-bold text-lg mb-2 text-foreground/90">{week.description}</h3>
                
                <div className="mt-4">
                  <div className="text-xs font-mono text-muted-foreground mb-3 tracking-wider">TARGET TOPICS</div>
                  <div className="flex flex-wrap gap-2">
                    {week.topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="bg-secondary/30 border-border text-foreground font-normal py-1">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-primary/50" />
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* End node */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 text-green-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.3)]">
              <Flag className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1 pt-1">
            <span className="font-bold text-green-500">Interview Day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
