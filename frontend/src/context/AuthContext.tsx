"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { getApiBase } from "@/lib/api";

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isAccountVerified?: boolean;
  isPhoneVerified?: boolean;
  phone?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (next: AuthUser | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readCachedUser = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
    if (typeof window !== "undefined") {
      if (next) {
        window.localStorage.setItem("user", JSON.stringify(next));
      } else {
        window.localStorage.removeItem("user");
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    const apiBase = getApiBase();
    if (!apiBase) {
      // When API_BASE is missing we cannot verify the session.
      // Only clear the user if there is no cached session to fall back on.
      if (!readCachedUser()) setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        // A 401/403 from /auth/me means the active cookie no longer maps to a valid
        // authenticated session. Clear any cached identity immediately so we never
        // keep showing one account while API calls run under another or no session.
        setUser(null);
        setLoading(false);
        return;
      }

      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload?.user?.id) {
        setUser(payload.user as AuthUser);
      }
      // For any other non-ok status (500, 502 etc.) keep the cached user alive.
    } catch (e) {
      // Network error — do NOT clear the user. A dropped connection or a brief
      // backend restart should not log the user out.
      console.warn("Network auth verification failed, keeping cached session", e);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      const apiBase = getApiBase();
      if (apiBase) {
        await fetch(`${apiBase}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      }
    } catch {
      // ignore logout network errors
    } finally {
      setUser(null);
      toast.success("Logged out");
    }
  }, [setUser]);

  useEffect(() => {
    const cachedUser = readCachedUser();
    if (cachedUser) {
      setUserState(cachedUser);
    }
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refresh,
      logout,
    }),
    [user, loading, setUser, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return ctx;
}
