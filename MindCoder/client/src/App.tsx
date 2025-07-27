// import { Switch, Route, useLocation } from "wouter";
// import { queryClient } from "./lib/queryClient";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { AuthProvider, useAuth } from "@/hooks/use-auth";
// import IDE from "@/pages/ide";
// import Landing from "@/pages/landing";
// import { LoginPage } from "@/pages/login";
// import SignupPage from "@/pages/signup";
// import NotFound from "@/pages/not-found";
// import { useEffect } from 'react';

// function AppContent() {
//   const { isAuthenticated } = useAuth();
//   const [location, setLocation] = useLocation();

//   // Check if the user is trying to access the IDE directly
//   useEffect(() => {
//     if (location === '/ide' && !isAuthenticated) {
//       setLocation('/');
//     }
//   }, [isAuthenticated, location, setLocation]);

//   return (
//     <Switch>
//       <Route path="/">
//         {() => <Landing />}
//       </Route>
//       <Route path="/ide">
//         {() => isAuthenticated ? <IDE /> : <Landing />}
//       </Route>
//       <Route path="/login">
//         {() => <LoginPage />}
//       </Route>
//       <Route path="/signup">
//         {() => <SignupPage />}
//       </Route>
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

// function Router() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Router />
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;


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
import NotFound from "@/pages/not-found";
import { useEffect } from 'react';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Check if the user is trying to access the IDE directly
  useEffect(() => {
    if (location === '/ide' && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <Switch>
      <Route path="/">
        {() => <Landing />}
      </Route>
      <Route path="/ide">
        {() => isAuthenticated ? <IDE /> : <Landing />}
      </Route>
      <Route path="/login">
        {() => <LoginPage />}
      </Route>
      <Route path="/signup">
        {() => <SignupPage />}
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