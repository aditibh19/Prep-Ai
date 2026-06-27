import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@workspace/replit-auth-web';
import { AppLayout } from '@/components/layout/AppLayout';

import LandingPage from '@/pages/landing';
import DashboardPage from '@/pages/dashboard';
import DsaTrackerPage from '@/pages/dsa/tracker';
import DsaStatsPage from '@/pages/dsa/stats';
import InterviewsListPage from '@/pages/interviews/list';
import StartInterviewPage from '@/pages/interviews/new';
import LiveInterviewPage from '@/pages/interviews/live';
import InterviewReportPage from '@/pages/interviews/report';
import ResumeAnalyzerPage from '@/pages/resume/analyzer';
import ResumeReportPage from '@/pages/resume/report';
import CompaniesPage from '@/pages/companies/list';
import CompanyRoadmapPage from '@/pages/companies/roadmap';
import StudyPlansPage from '@/pages/study-plans/list';
import StudyPlanDetailPage from '@/pages/study-plans/detail';
import AnalyticsPage from '@/pages/analytics';
import ProfilePage from '@/pages/profile';
import SettingsPage from '@/pages/settings';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background text-primary">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <AppLayout>
      <Component {...rest} />
    </AppLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background text-primary">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/" component={() => (isAuthenticated ? <Redirect to="/dashboard" /> : <LandingPage />)} />
      
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
      
      <Route path="/dsa" component={() => <ProtectedRoute component={DsaTrackerPage} />} />
      <Route path="/dsa/stats" component={() => <ProtectedRoute component={DsaStatsPage} />} />
      
      <Route path="/interviews" component={() => <ProtectedRoute component={InterviewsListPage} />} />
      <Route path="/interviews/new" component={() => <ProtectedRoute component={StartInterviewPage} />} />
      <Route path="/interviews/:id" component={(params: any) => <ProtectedRoute component={LiveInterviewPage} params={params} />} />
      <Route path="/interviews/:id/report" component={(params: any) => <ProtectedRoute component={InterviewReportPage} params={params} />} />
      
      <Route path="/resume" component={() => <ProtectedRoute component={ResumeAnalyzerPage} />} />
      <Route path="/resume/:id" component={(params: any) => <ProtectedRoute component={ResumeReportPage} params={params} />} />
      
      <Route path="/companies" component={() => <ProtectedRoute component={CompaniesPage} />} />
      <Route path="/companies/:id" component={(params: any) => <ProtectedRoute component={CompanyRoadmapPage} params={params} />} />
      
      <Route path="/study-plans" component={() => <ProtectedRoute component={StudyPlansPage} />} />
      <Route path="/study-plans/:id" component={(params: any) => <ProtectedRoute component={StudyPlanDetailPage} params={params} />} />
      
      <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;