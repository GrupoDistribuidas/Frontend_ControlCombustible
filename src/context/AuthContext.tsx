import { createContext, useContext, useState } from "react";

type User = { id?: number; name?: string; email?: string; role?: string } | null;

type AuthContextType = {
  token: string | null;
  user: User;
  isAuthenticated: boolean;
  login: (token: string, user?: User) => void; // acepta user opcional
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (t: string, u?: User) => {
    localStorage.setItem("token", t);
    setToken(t);
    if (u !== undefined) {
      localStorage.setItem("user", JSON.stringify(u));
      setUser(u);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
