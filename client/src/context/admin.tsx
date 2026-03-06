import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminContext {
  token: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  adminFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const AdminCtx = createContext<AdminContext | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem("bc-admin-token"); } catch { return null; }
  });

  useEffect(() => {
    if (token) localStorage.setItem("bc-admin-token", token);
    else localStorage.removeItem("bc-admin-token");
  }, [token]);

  const login = async (password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.token);
    return true;
  };

  const logout = () => setToken(null);

  const adminFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token || "",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return res.json();
  };

  return (
    <AdminCtx.Provider value={{ token, login, logout, isAuthenticated: !!token, adminFetch }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
}
