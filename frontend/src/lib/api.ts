"use client";

export const getApiBase = () => {
  const rawApi = process.env.NEXT_PUBLIC_API_URL?.trim() || "";

  if (typeof window === "undefined") {
    return rawApi;
  }

  const fallbackApi = `${window.location.protocol}//${window.location.hostname}:5001/api`;
  const resolvedApi = rawApi || fallbackApi;

  if (window.location.hostname === "127.0.0.1" && resolvedApi.includes("localhost")) {
    return resolvedApi.replace("localhost", "127.0.0.1");
  }
  if (window.location.hostname === "localhost" && resolvedApi.includes("127.0.0.1")) {
    return resolvedApi.replace("127.0.0.1", "localhost");
  }

  return resolvedApi;
};

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBase()}${normalizedPath}`;
};

// ── Token management for Safari cross-origin cookie fix ──────────────────
const TOKEN_KEY = "auth_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Drop-in replacement for fetch() that automatically includes:
 *  1. credentials: "include" (for cookie-based auth)
 *  2. Authorization: Bearer <token> header (for Safari / cross-origin)
 *
 * Works everywhere: Chrome, Safari, Firefox, iOS Safari, etc.
 */
export const authFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
};
