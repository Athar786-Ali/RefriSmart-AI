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

// Fix: If the browser is on 127.0.0.1 but API_URL is localhost, cookies will be blocked by CORS due to origin mismatch.
// Dynamically swap them so the request always perfectly matches the domain the user is viewing.
const getApiBase = () => {
  const rawApi = process.env.NEXT_PUBLIC_API_URL || "";
  if (typeof window === "undefined") return rawApi;
  
  if (window.location.hostname === "127.0.0.1" && rawApi.includes("localhost")) {
    return rawApi.replace("localhost", "127.0.0.1");
  }
  if (window.location.hostname === "localhost" && rawApi.includes("127.0.0.1")) {
    return rawApi.replace("127.0.0.1", "localhost");
  }
  return rawApi;
};

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

  // Instantly hydrate user from cache on initial mount to completely prevent "Logged Out" UI flickering
  useEffect(() => {
    const cached = readCachedUser();
    if (cached) setUserState(cached);
  }, []);

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
      // Issue #21 Fix: When API_BASE is missing we have no way to verify the
      // session, so set user to null rather than serving potentially stale
      // and expired cached data from localStorage.
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      
      // Fix: Only clear active session if the backend explicitly rejects the JWT
      if (res.status === 401 || res.status === 403) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload?.user?.id) {
        setUser(payload.user as AuthUser);
      }
    } catch (e) {
      // Fix: Do NOT call setUser(null) on network errors.
      // If the user's internet drops while refreshing, they shouldn't lose their localStorage auth cache!
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
