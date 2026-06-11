"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

// How often to silently re-verify the session (every 10 minutes)
const SESSION_REFRESH_INTERVAL = 10 * 60 * 1000;

// How many consecutive network failures before we give up on the cached session
const MAX_NETWORK_FAILURES = 3;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const networkFailureCount = useRef(0);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      if (res.ok) {
        // Successful response — reset failure counter
        networkFailureCount.current = 0;
        const payload = await res.json().catch(() => ({}));
        if (payload?.user?.id) {
          setUser(payload.user as AuthUser);
        }
        return;
      }

      if (res.status === 401 || res.status === 403) {
        // Only clear session if backend explicitly says token is invalid.
        // But first confirm this isn't a transient server error.
        networkFailureCount.current = 0; // Reset — this is a clean response
        setUser(null);
        setLoading(false);
        return;
      }

      // For 5xx and other errors — keep cached user alive (server may be restarting)
      console.warn(`[Auth] /auth/me returned ${res.status} — keeping cached session`);

    } catch (e) {
      // Pure network error (no internet, backend down temporarily)
      // Do NOT log out — increment failure count instead
      networkFailureCount.current += 1;
      console.warn(
        `[Auth] Network error verifying session (attempt ${networkFailureCount.current}/${MAX_NETWORK_FAILURES}):`,
        e
      );

      if (networkFailureCount.current >= MAX_NETWORK_FAILURES) {
        // Only clear after too many consecutive failures AND no cached user
        if (!readCachedUser()) {
          setUser(null);
        }
      }
      // Keep cached user alive for network errors
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    // Stop the refresh interval
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
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
      networkFailureCount.current = 0;
      toast.success("Logged out");
    }
  }, [setUser]);

  // Initial session check on mount
  useEffect(() => {
    const cachedUser = readCachedUser();
    if (cachedUser) {
      setUserState(cachedUser);
    }
    void refresh();
  }, [refresh]);

  // Silent session keepalive — re-verifies every 10 minutes
  // This prevents "session ended" messages caused by stale auth checks
  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      void refresh();
    }, SESSION_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
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
