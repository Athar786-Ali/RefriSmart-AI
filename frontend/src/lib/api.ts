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
