import { logoutUser } from "./users";

export const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    // server-side fallback (build)
    return process.env.NEXT_PUBLIC_API_URL_LAN!;
  }

  const host = window.location.hostname;
  if (host.includes("localhost")) return process.env.NEXT_PUBLIC_API_URL_LOCAL!;
  if (host.includes("rpi.local")) return process.env.NEXT_PUBLIC_API_URL_LAN!;
  if (host.startsWith("100.")) return process.env.NEXT_PUBLIC_API_URL_TAILSCALE!;
  return process.env.NEXT_PUBLIC_API_URL_LOCAL!;
};

// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const opts: RequestInit = {
    ...options,
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  };

  if (opts.body && typeof opts.body !== "string") {
    opts.body = JSON.stringify(opts.body);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };

  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  if (token) {
    if (isTokenExpired(token)) {
      logout();
      throw new Error("Token expired");
    }

    headers["Authorization"] = `Bearer ${token}`;
  }

  //Old way
  // const res = await fetch(`${API_BASE_URL}${url}`, {
  //   ...opts,
  //   headers,
  // });

  //New dynamic
  const res = await fetch(`${getApiBaseUrl()}${url}`, {
  ...opts,
  headers,
});
  const res = await fetch(`${API_BASE_URL}${url}`, opts);

  if (res.status === 401) {
    logoutUser();
    throw new Error("Session expired");
  }

  // Hvis andre fejl
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (null as unknown as T);
};