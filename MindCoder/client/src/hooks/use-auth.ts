import { useState, useEffect, useContext, createContext, ReactNode, createElement } from "react";
import { useToast } from "./use-toast";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for token in sessionStorage on mount (will be cleared when browser is closed)
    const storedToken = sessionStorage.getItem('devmindx_token');
    const storedUser = sessionStorage.getItem('devmindx_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Clear invalid data
        sessionStorage.removeItem('devmindx_token');
        sessionStorage.removeItem('devmindx_user');
      }
    }

    // Check URL for OAuth callback or auth error
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUser = urlParams.get('user');
    const authError = urlParams.get('error');
    
    if (authError) {
      toast({
        title: "Authentication Failed",
        description: "There was an issue with the OAuth login process. Please try again.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlToken && urlUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(urlUser));
        login(urlToken, userData);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in via OAuth.",
        });
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "There was an issue parsing the login data.",
          variant: "destructive",
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Check token validity on mount
    const checkToken = async () => {
      const storedToken = sessionStorage.getItem('devmindx_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/projects', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.status === 401) {
            logout();
          }
        } catch (e) {
          // If fetch fails (e.g., backend down), optionally logout or ignore
        }
      }
    };
    checkToken();
  }, [toast]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    sessionStorage.setItem('devmindx_token', newToken);
    sessionStorage.setItem('devmindx_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('devmindx_token');
    sessionStorage.removeItem('devmindx_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return createElement(AuthContext.Provider, {
    value: {
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user && !!token
    }
  }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}