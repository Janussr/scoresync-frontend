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

  
  const res = await fetch(`${getApiBaseUrl()}${url}`, {
  ...opts,
  headers,
});

 if (res.status === 401) {
  logoutUser();

  if (typeof window !== "undefined") {
    window.location.href = "/account/login"; 
  }

  throw {
    status: 401,
    message: "Session expired",
  };
}

 if (!res.ok) {
  let errorData: any = null;

  try {
    errorData = await res.json();
  } catch {
    errorData = await res.text();
  }

  throw {
    status: res.status,
    message:
      errorData?.title ||
      errorData?.message ||
      errorData ||
      "API error",
  };
}

  const text = await res.text();
  return text ? JSON.parse(text) : (null as unknown as T);
};