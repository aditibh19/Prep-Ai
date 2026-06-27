import { useListStudyPlans, useCreateStudyPlan } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { 
  GraduationCap, 
  Calendar, 
  ChevronRight, 
  Plus,
  Building2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  targetCompany: z.string().min(1, "Target company is required"),
  daysLeft: z.coerce.number().min(7, "Minimum 7 days").max(180, "Maximum 180 days"),
});

export default function StudyPlansPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: plans, isLoading } = useListStudyPlans({
    query: { queryKey: ["study-plans"] }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetCompany: "",
      daysLeft: 30,
    },
  });

  // Pre-fill if coming from roadmap page
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const companyParam = params.get("company");
    if (companyParam) {
      form.setValue("targetCompany", companyParam);
      setIsOpen(true);
    }
  }, [searchString, form]);

  const createMutation = useCreateStudyPlan({
    mutation: {
      onSuccess: (plan) => {
        queryClient.invalidateQueries({ queryKey: ["study-plans"] });
        toast.success("Execution plan initialized");
        setIsOpen(false);
        setLocation(`/study-plans/${plan.id}`);
      },
      onError: () => {
        toast.error("Failed to generate plan");
      }
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate({ data });
  };

  return (
    <div className="space-y-8 pb-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Execution Plans</h1>
          <p className="text-muted-foreground">Structured timelines to dominate your interviews.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-card">
            <DialogHeader>
              <DialogTitle>Initialize Execution Plan</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="targetCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Company/Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Google SDE, Startup Fullstack" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysLeft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days Until Interview</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground font-bold"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Computing timeline..." : "Generate Plan"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-40 border border-border bg-card rounded-lg animate-pulse"></div>
          ))
        ) : plans && plans.length > 0 ? (
          plans.map((plan) => (
            <Link 
              key={plan.id} 
              href={`/study-plans/${plan.id}`}
              className="border border-border bg-card rounded-lg p-5 flex flex-col hover:border-primary/50 hover:bg-secondary/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {plan.targetCompany}
                  </h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Created {format(parseISO(plan.createdAt), "MMM d")}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {plan.daysLeft} days prep</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-auto">
                <div className="text-xs font-mono text-muted-foreground mb-2">TIMELINE OVERVIEW</div>
                <div className="flex gap-1 h-2">
                  {plan.weeks.map((_, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-full"></div>
                  ))}
                </div>
                <div className="text-xs text-right text-muted-foreground mt-1">{plan.weeks.length} weeks total</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full border border-border border-dashed bg-card/50 rounded-lg p-12 text-center flex flex-col items-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No plans active</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">Generate an AI-driven weekly study schedule optimized for your target company.</p>
            <Button onClick={() => setIsOpen(true)} className="bg-primary text-primary-foreground">
              Create Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
