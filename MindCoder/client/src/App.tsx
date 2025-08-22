
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import IDE from "@/pages/ide";
import Landing from "@/pages/landing";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import Projects from "@/pages/projects";
import NotFound from "@/pages/not-found";
import AccountSettings from "@/pages/account";
import CollaborationLanding from "@/components/CollaborationLanding";
import { useEffect, useState } from 'react';

function AppContent() {
  const { isAuthenticated, login } = useAuth();
  const [location, setLocation] = useLocation();
  const [showCollaborationLanding, setShowCollaborationLanding] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Check for collaboration invite, OAuth errors, and OAuth success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invite = urlParams.get('invite');
    const shouldLogout = urlParams.get('logout') === 'true';
    const oauthError = urlParams.get('error');
    const oauthProvider = urlParams.get('provider');
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
    // Handle OAuth success (token and user data present)
    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        
        // Use the auth hook's login function
        login(token, user);
        
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('user');
        window.history.replaceState({}, '', newUrl.toString());
        
        // Redirect to IDE
        setLocation('/ide');
        
        // Show success message
        setTimeout(() => {
          alert('OAuth login successful! Welcome to DevMindX.');
        }, 100);
        
        return;
      } catch (error) {
        console.error('Error parsing OAuth user data:', error);
      }
    }
    
    if (invite) {
      setInviteCode(invite);
      setShowCollaborationLanding(true);
      
      // If logout parameter is present, clear authentication
      if (shouldLogout) {
        localStorage.removeItem('devmindx_token');
        localStorage.removeItem('devmindx_user');
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('logout');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
    
    // Handle OAuth configuration errors
    if (oauthError === 'oauth_not_configured') {
      // Show alert for OAuth configuration error
      alert(`${oauthProvider?.charAt(0).toUpperCase() + oauthProvider?.slice(1)} OAuth is not configured. Please set up ${oauthProvider} OAuth credentials. Check OAUTH_SETUP.md for instructions.`);
      
      // Clean up URL parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      newUrl.searchParams.delete('provider');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [setLocation, login]);

  // Check if the user is trying to access protected routes directly
  useEffect(() => {
    if ((location === '/ide' || location === '/projects') && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, location, setLocation]);

  const handleJoinSession = () => {
    setShowCollaborationLanding(false);
    setLocation('/ide');
  };

  if (showCollaborationLanding && inviteCode) {
    return (
      <CollaborationLanding 
        inviteCode={inviteCode} 
        onJoinSession={handleJoinSession} 
      />
    );
  }

  return (
    <Switch>
      <Route path="/">
        {() => <Landing />}
      </Route>
      <Route path="/ide">
        {() => isAuthenticated ? <IDE /> : <Landing />}
      </Route>
      <Route path="/projects">
        {() => isAuthenticated ? <Projects /> : <Landing />}
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;