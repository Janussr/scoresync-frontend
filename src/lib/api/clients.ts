import { logoutUser } from "./users";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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