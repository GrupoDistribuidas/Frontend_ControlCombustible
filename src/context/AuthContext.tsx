import { createContext, useContext, useEffect, useRef, useState } from "react";
import { msUntilExpiry, parseJwt } from "../utils/jwt";

type User = { id?: number; name?: string; email?: string; role?: string } | null;

type AuthContextType = {
  token: string | null;
  user: User;
  isAuthenticated: boolean;
  login: (token: string, user?: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // guardamos el id del timeout para limpiarlo cuando cambie el token
  const expiryTimerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (expiryTimerRef.current) {
      window.clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  const forceToLogin = () => {
    // redirección inmediata al login
    if (location.pathname !== "/login") {
      window.location.replace("/login");
    }
  };

  const scheduleAutoLogout = (t: string) => {
    clearTimer();
    const ms = msUntilExpiry(t);
    if (ms !== null) {
      if (ms <= 0) {
        logout(); // ya expiró
        return;
      }
      expiryTimerRef.current = window.setTimeout(() => {
        logout(); // al disparar, borra sesión
      }, ms);
    }
  };

  const login = (t: string, u?: User) => {
    localStorage.setItem("token", t);
    setToken(t);
    if (u !== undefined) {
      localStorage.setItem("user", JSON.stringify(u));
      setUser(u);
    }
    scheduleAutoLogout(t);
  };

  const logout = () => {
    clearTimer();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    forceToLogin();
  };

  // Al cargar la app, valida si el token ya caducó
  useEffect(() => {
    if (!token) return;
    const ms = msUntilExpiry(token);
    if (ms === null) {
      // token sin exp → por seguridad, cerrar
      logout();
      return;
    }
    if (ms <= 0) {
      logout();
      return;
    }
    // opcional: refresca user desde payload si no hay user persistido
    if (!user) {
      const payload = parseJwt(token);
      if (payload?.name || payload?.email || payload?.role) {
        setUser({
          name: (payload as any).name,
          email: (payload as any).email,
          role: (payload as any).role,
        });
      }
    }
    scheduleAutoLogout(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  // sincroniza entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        const newToken = localStorage.getItem("token");
        setToken(newToken);
        if (newToken) scheduleAutoLogout(newToken);
        else clearTimer();
      }
      if (e.key === "user") {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
