import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import TestDashboard from "./pages/TestDashboard";
import ProfileReview from "./pages/ProfileReview";
import RoleMatching from "./pages/RoleMatching";
import JobOpenings from "./pages/JobOpenings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile-review" element={<ProfileReview />} />
          <Route path="/role-matching" element={<RoleMatching />} />
          <Route path="/job-openings" element={<JobOpenings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-dashboard" element={<TestDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
