import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface User {
  id: number | string;
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

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("devmindx_token", newToken);
    localStorage.setItem("devmindx_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("devmindx_token");
    localStorage.removeItem("devmindx_user");
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("devmindx_token");
    const storedUser = localStorage.getItem("devmindx_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem("devmindx_token");
        localStorage.removeItem("devmindx_user");
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("devmindx_token");
    if (!stored) return;
    fetch("/api/projects", { headers: { Authorization: `Bearer ${stored}` } }).then(
      (res) => {
        if (res.status === 401) logout();
      },
      () => {},
    );
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
