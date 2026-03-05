"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UserRole = "User" | "Admin" | null;

type AuthContextType = {
  token: string | null;
  role: UserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hydrated: boolean;
  userId: number | null;
  username: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const applyToken = (jwt: string) => {
    const payload = parseJwt(jwt);

    if (!payload) return logout();

    if (payload.exp * 1000 < Date.now()) {
      return logout();
    }

    setToken(jwt);
    setRole(
      payload?.role ??
      payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      null
    );
    setUserId(payload?.id ?? null);
    setUsername(payload?.unique_name ?? null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      applyToken(storedToken);
    }

    setHydrated(true);
  }, []);

  const login = (jwt: string) => {
    localStorage.setItem("token", jwt);
    applyToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
    setUserId(null);
    setUsername(null);
  };

  const isAdmin = role === "Admin";

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        isLoggedIn: !!token,
        isAdmin,
        login,
        logout,
        hydrated,
        userId,
        username
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}