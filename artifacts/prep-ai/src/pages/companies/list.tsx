import { useListCompanies, useGenerateCompanyRoadmap } from "@workspace/api-client-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Building2, ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CompaniesPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  
  const { data: companies, isLoading } = useListCompanies({
    query: { queryKey: ["companies"] }
  });

  const generateMutation = useGenerateCompanyRoadmap({
    mutation: {
      onSuccess: (roadmap) => {
        toast.success("Roadmap generated");
        setLocation(`/companies/${roadmap.companyId}`);
      },
      onError: () => {
        toast.error("Failed to generate roadmap");
      }
    }
  });

  const filteredCompanies = companies?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleGenerate = (id: number) => {
    generateMutation.mutate({ id });
  };

  return (
    <div className="space-y-8 pb-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Intel</h1>
          <p className="text-muted-foreground">Targeted roadmaps based on historical interview data.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search company or topic..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 border border-border bg-card rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredCompanies && filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="border border-border bg-card rounded-lg p-5 flex flex-col group hover:border-primary/50 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.05)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center font-bold text-xl border border-border group-hover:border-primary/30 transition-colors">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-8 h-8 object-contain" />
                    ) : (
                      company.name.substring(0, 1)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{company.name}</h3>
                    <div className="text-xs font-mono text-muted-foreground">{company.difficulty} Bar</div>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Core Focus</p>
                <div className="flex flex-wrap gap-1.5">
                  {company.topics.slice(0, 4).map((topic, i) => (
                    <Badge key={i} variant="outline" className="bg-secondary/50 font-normal border-border text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {company.topics.length > 4 && (
                    <Badge variant="outline" className="bg-secondary/50 font-normal border-border text-xs">
                      +{company.topics.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => handleGenerate(company.id)}
                disabled={generateMutation.isPending}
                className="w-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground group-hover:border-primary transition-all"
                variant="outline"
              >
                {generateMutation.isPending && generateMutation.variables?.id === company.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Compile Intel <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-lg bg-card/50">
          <Building2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No intel found</h3>
          <p className="text-sm text-muted-foreground">We don't have data matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
