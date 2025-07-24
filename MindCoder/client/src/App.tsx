import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import IDE from "@/pages/ide";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if the user is trying to access the IDE directly
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/ide' && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Switch>
      <Route path="/">
        {() => <Landing />}
      </Route>
      <Route path="/ide">
        {() => isAuthenticated ? <IDE /> : <Landing />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
