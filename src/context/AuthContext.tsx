"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, getCurrentUser } from "@/lib/api/users";
import { getActiveGameForPlayerPage } from "@/lib/api/games";
import type { UserRole } from "@/lib/models/user";
import { usePathname } from "next/navigation";

type AuthContextType = {
  role: UserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hydrated: boolean;
  userId: number | null;
  username: string | null;
  activeGameId: number | null;
  setActiveGameId: (id: number | null) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeGameId, setActiveGameId] = useState<number | null>(null);

  const isAdmin = role === "Admin";
  const isLoggedIn = !!userId;

  const pathname = usePathname();

  // ----- Fetch current user & active game -----
  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setUserId(null);
        setUsername(null);
        setRole(null);
        setActiveGameId(null);
        return;
      }

      setUserId(user.id);
      setUsername(user.username);
      setRole(user.role);

      // 🔹 Fetch active game for this user
      try {
        const activeGame = await getActiveGameForPlayerPage();
        if (activeGame?.players?.some(p => p.userId === user.id)) {
          setActiveGameId(activeGame.id);
        } else {
          setActiveGameId(null);
        }
      } catch (err) {
        setActiveGameId(null);
      }

    } catch (err: any) {
      if (err.message !== "Unauthorized") console.error("Failed to fetch current user", err);
      setUserId(null);
      setUsername(null);
      setRole(null);
      setActiveGameId(null);
    } finally {
      setHydrated(true);
    }
  };

  useEffect(() => {
    if (hydrated) return;

    const isAuthPage = pathname.startsWith("/account/login");
    if (isAuthPage) {
      setHydrated(true);
      return;
    }

    fetchCurrentUser();
  }, [pathname, hydrated]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const success = await loginUser(username, password);
      if (!success) return false;

      await fetchCurrentUser();
      return true;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      setUserId(null);
      setUsername(null);
      setRole(null);
      setActiveGameId(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isLoggedIn,
        isAdmin,
        hydrated,
        userId,
        username,
        activeGameId,
        setActiveGameId,
        login,
        logout,
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