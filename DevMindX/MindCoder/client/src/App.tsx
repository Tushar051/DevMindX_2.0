
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect, Suspense } from 'react';
import { useCollab } from '@/hooks/use-collab';
import Home from "@/pages/home-ai-professional";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import Projects from "@/pages/projects";
import Generator from "@/pages/generator-enhanced";
import CursorIDE from "@/pages/cursor-ide";
import SandboxTest from "@/pages/sandbox-test";
import LearningMode from "@/pages/learning-mode";
import ArchitectureGenerator from "@/pages/architecture-generator";
import ResearchEngine from "@/pages/research-engine";
import NotFound from "@/pages/not-found";
import AccountSettings from "@/pages/account";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function AppContent() {
  const { isAuthenticated, login } = useAuth();
  const [location, setLocation] = useLocation();
  const collab = useCollab();

  // Check for OAuth errors and OAuth success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const oauthProvider = urlParams.get('provider');
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
    // Handle OAuth success (token and user data present)
    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        login(token, user);
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('user');
        window.history.replaceState({}, '', newUrl.toString());
        // Redirect to IDE
        setLocation('/ide');
        setTimeout(() => {
          alert('OAuth login successful! Welcome to DevMindX.');
        }, 100);
        return;
      } catch (error) {
        console.error('Error parsing OAuth user data:', error);
      }
    }
    
    // Handle OAuth configuration errors
    if (oauthError === 'oauth_not_configured' && oauthProvider) {
      alert(`${oauthProvider.charAt(0).toUpperCase() + oauthProvider.slice(1)} OAuth is not configured. Please set up ${oauthProvider} OAuth credentials. Check OAUTH_SETUP.md for instructions.`);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      newUrl.searchParams.delete('provider');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [setLocation, login]);

  // Check if the user is trying to access protected routes directly
  useEffect(() => {
    if ((location === '/ide' || location === '/generator' || location === '/projects') && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, location, setLocation]);

  // Handle deep link join: /#/collab/:sessionId
  useEffect(() => {
    const hash = window.location.hash || '';
    const match = hash.match(/#\/collab\/([^/?#]+)/);
    if (match && isAuthenticated) {
      const sessionId = match[1];
      collab.joinSession(sessionId);
      setLocation('/generator');
    }
  }, [isAuthenticated, setLocation]);

  return (
    <Switch>
      <Route path="/">
        {() => <Home />}
      </Route>
      <Route path="/ide">
        {() => isAuthenticated ? <Generator /> : <Home />}
      </Route>
      <Route path="/generator">
        {() => isAuthenticated ? <Generator /> : <Home />}
      </Route>
      <Route path="/cursor-ide">
        {() => isAuthenticated ? <CursorIDE /> : <Home />}
      </Route>
      <Route path="/sandbox-test">
        {() => isAuthenticated ? <SandboxTest /> : <Home />}
      </Route>
      <Route path="/learning-mode">
        {() => isAuthenticated ? <LearningMode /> : <Home />}
      </Route>
      <Route path="/architecture">
        {() => isAuthenticated ? <ArchitectureGenerator /> : <Home />}
      </Route>
      <Route path="/research">
        {() => isAuthenticated ? <ResearchEngine /> : <Home />}
      </Route>
      <Route path="/projects">
        {() => isAuthenticated ? <Projects /> : <Home />}
      </Route>
      <Route path="/login">
        {() => <LoginPage />}
      </Route>
      <Route path="/signup">
        {() => <SignupPage />}
      </Route>
      <Route path="/account" component={AccountSettings} />
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-white text-xl">Loading...</div>
            </div>
          }>
            <Router />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;