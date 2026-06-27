import { useState } from "react";
import { 
  useListDsaProblems, 
  useCreateDsaProblem, 
  useUpdateDsaProblem, 
  useDeleteDsaProblem,
  useGetDsaStats
} from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { 
  Code2, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  RefreshCcw,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  status: z.enum(["Solved", "Pending", "Revision"]),
  link: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DsaTrackerPage() {
  const queryClient = useQueryClient();
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: stats } = useGetDsaStats({
    query: { queryKey: ["dsa-stats"] }
  });

  const { data: problems, isLoading } = useListDsaProblems(
    { 
      ...(topicFilter !== "all" && { topic: topicFilter }),
      ...(difficultyFilter !== "all" && { difficulty: difficultyFilter }),
      ...(statusFilter !== "all" && { status: statusFilter }),
    },
    { query: { queryKey: ["dsa-problems", topicFilter, difficultyFilter, statusFilter] } }
  );

  const createMutation = useCreateDsaProblem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["dsa-problems"] });
        queryClient.invalidateQueries({ queryKey: ["dsa-stats"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        toast.success("Problem added");
        setIsAddOpen(false);
        form.reset();
      }
    }
  });

  const updateMutation = useUpdateDsaProblem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["dsa-problems"] });
        queryClient.invalidateQueries({ queryKey: ["dsa-stats"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        toast.success("Problem updated");
        setEditingId(null);
      }
    }
  });

  const deleteMutation = useDeleteDsaProblem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["dsa-problems"] });
        queryClient.invalidateQueries({ queryKey: ["dsa-stats"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        toast.success("Problem deleted");
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      topic: "",
      difficulty: "Medium",
      status: "Pending",
      link: "",
      notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  const handleEdit = (problem: any) => {
    setEditingId(problem.id);
    form.reset({
      title: problem.title,
      topic: problem.topic,
      difficulty: problem.difficulty,
      status: problem.status,
      link: problem.link || "",
      notes: problem.notes || "",
    });
    setIsAddOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this problem?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleStatusToggle = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Solved" ? "Pending" : "Solved";
    updateMutation.mutate({ id, data: { status: newStatus as any } });
  };

  const filteredProblems = problems?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.topic.toLowerCase().includes(search.toLowerCase())
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-green-500 border-green-500/20 bg-green-500/10";
      case "Medium": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "Hard": return "text-red-500 border-red-500/20 bg-red-500/10";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DSA Tracker</h1>
          <p className="text-muted-foreground">Master data structures and algorithms systematically.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingId(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Problem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-border bg-card">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Problem" : "Add New Problem"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Two Sum" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Arrays, Trees" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Solved">Solved</SelectItem>
                            <SelectItem value="Revision">Revision</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="LeetCode link..." {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Key insights, time/space complexity..." 
                          className="resize-none h-24 bg-background" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? "Save Changes" : "Save Problem"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          <div className="col-span-3 md:col-span-2 p-4 border border-border bg-card rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">Overall Progress</div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold">{stats.solved} <span className="text-sm font-normal text-muted-foreground">/ {stats.total}</span></span>
              <span className="text-primary font-medium text-sm">{stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}%</span>
            </div>
            <Progress value={stats.total > 0 ? (stats.solved / stats.total) * 100 : 0} className="h-1.5 bg-secondary" />
          </div>
          <div className="p-4 border border-border bg-card rounded-lg flex flex-col justify-center items-center text-center">
            <span className="text-2xl font-bold text-green-500 font-mono">{stats.solved}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Solved</span>
          </div>
          <div className="p-4 border border-border bg-card rounded-lg flex flex-col justify-center items-center text-center">
            <span className="text-2xl font-bold text-yellow-500 font-mono">{stats.pending}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Pending</span>
          </div>
          <div className="p-4 border border-border bg-card rounded-lg flex flex-col justify-center items-center text-center">
            <span className="text-2xl font-bold text-blue-500 font-mono">{stats.revision}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Revision</span>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search problems or topics..." 
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-card border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Solved">Solved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Revision">Revision</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[130px] bg-card border-border">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diff.</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Problems List */}
      <div className="border border-border bg-card rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading tracker...</div>
        ) : filteredProblems && filteredProblems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium w-12">Status</th>
                  <th className="px-4 py-3 font-medium">Problem</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium">Added On</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProblems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleStatusToggle(problem.id, problem.status)}
                        className="text-muted-foreground hover:text-primary transition-colors outline-none"
                      >
                        {problem.status === "Solved" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : problem.status === "Revision" ? (
                          <RefreshCcw className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className={problem.status === "Solved" ? "line-through text-muted-foreground" : "text-foreground"}>
                          {problem.title}
                        </span>
                        {problem.link && (
                          <a href={problem.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border font-normal">
                        {problem.topic}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`font-normal ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {format(parseISO(problem.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => handleEdit(problem)} className="cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateMutation.mutate({ id: problem.id, data: { status: "Revision" as any }})}
                            className="cursor-pointer"
                          >
                            <RefreshCcw className="mr-2 h-4 w-4" /> Mark for Revision
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(problem.id)} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Code2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No problems found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-2">
              {search || topicFilter !== "all" 
                ? "Try adjusting your filters or search term." 
                : "You haven't added any DSA problems yet. Start building your tracker!"}
            </p>
            {(!search && topicFilter === "all") && (
              <Button 
                onClick={() => setIsAddOpen(true)} 
                variant="outline" 
                className="mt-6 border-primary/20 text-primary hover:bg-primary/10"
              >
                <Plus className="mr-2 h-4 w-4" /> Add First Problem
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
