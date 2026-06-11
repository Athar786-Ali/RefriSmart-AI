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
import { getApiBase, authFetch, setStoredToken, getStoredToken } from "@/lib/api";

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

// How many consecutive network failures before we give up
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
        setStoredToken(null); // Clear token on logout
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    const apiBase = getApiBase();
    if (!apiBase) {
      if (!readCachedUser()) setUser(null);
      setLoading(false);
      return;
    }

    // If we have no token and no cached user, skip the /me call
    const hasToken = !!getStoredToken();
    const hasCachedUser = !!readCachedUser();
    if (!hasToken && !hasCachedUser) {
      setLoading(false);
      return;
    }

    try {
      // Use authFetch which includes Authorization: Bearer header
      const res = await authFetch(`${apiBase}/auth/me`);

      if (res.ok) {
        networkFailureCount.current = 0;
        const payload = await res.json().catch(() => ({}));
        if (payload?.user?.id) {
          setUser(payload.user as AuthUser);
        }
        return;
      }

      if (res.status === 401 || res.status === 403) {
        // Token is genuinely invalid — clean logout
        networkFailureCount.current = 0;
        setUser(null);
        setStoredToken(null);
        setLoading(false);
        return;
      }

      // 5xx — server issue, keep cached user
      console.warn(`[Auth] /auth/me returned ${res.status} — keeping cached session`);
    } catch (e) {
      networkFailureCount.current += 1;
      console.warn(
        `[Auth] Network error (${networkFailureCount.current}/${MAX_NETWORK_FAILURES}):`,
        e
      );
      if (networkFailureCount.current >= MAX_NETWORK_FAILURES && !readCachedUser()) {
        setUser(null);
        setStoredToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    try {
      const apiBase = getApiBase();
      if (apiBase) {
        await authFetch(`${apiBase}/auth/logout`, { method: "POST" });
      }
    } catch {
      // ignore
    } finally {
      setUser(null);
      setStoredToken(null);
      networkFailureCount.current = 0;
      toast.success("Logged out");
    }
  }, [setUser]);

  // Initial session check
  useEffect(() => {
    const cachedUser = readCachedUser();
    if (cachedUser) setUserState(cachedUser);
    void refresh();
  }, [refresh]);

  // Silent keepalive every 10 minutes
  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      void refresh();
    }, SESSION_REFRESH_INTERVAL);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, setUser, refresh, logout }),
    [user, loading, setUser, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider.");
  return ctx;
}
