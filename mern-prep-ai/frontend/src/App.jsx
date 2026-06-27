import { Router, Route, Switch, Redirect } from "wouter";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import AppLayout from "./components/AppLayout.jsx";

// Pages
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DsaTracker from "./pages/DsaTracker.jsx";
import InterviewList from "./pages/interviews/InterviewList.jsx";
import InterviewNew from "./pages/interviews/InterviewNew.jsx";
import InterviewLive from "./pages/interviews/InterviewLive.jsx";
import InterviewReport from "./pages/interviews/InterviewReport.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import Companies from "./pages/Companies.jsx";
import CompanyRoadmap from "./pages/CompanyRoadmap.jsx";
import StudyPlans from "./pages/StudyPlans.jsx";
import Analytics from "./pages/Analytics.jsx";
import Profile from "./pages/Profile.jsx";

function ProtectedRoute({ component: Component, ...props }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Redirect to="/" />;
  return (
    <AppLayout>
      <Component {...props} />
    </AppLayout>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Switch>
      <Route path="/">{user ? <Redirect to="/dashboard" /> : <Landing />}</Route>
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/dsa"><ProtectedRoute component={DsaTracker} /></Route>
      <Route path="/interviews"><ProtectedRoute component={InterviewList} /></Route>
      <Route path="/interviews/new"><ProtectedRoute component={InterviewNew} /></Route>
      <Route path="/interviews/:id/live">
        {(params) => <ProtectedRoute component={InterviewLive} params={params} />}
      </Route>
      <Route path="/interviews/:id/report">
        {(params) => <ProtectedRoute component={InterviewReport} params={params} />}
      </Route>
      <Route path="/resume"><ProtectedRoute component={ResumeAnalyzer} /></Route>
      <Route path="/companies"><ProtectedRoute component={Companies} /></Route>
      <Route path="/companies/:id">
        {(params) => <ProtectedRoute component={CompanyRoadmap} params={params} />}
      </Route>
      <Route path="/study-plans"><ProtectedRoute component={StudyPlans} /></Route>
      <Route path="/analytics"><ProtectedRoute component={Analytics} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
