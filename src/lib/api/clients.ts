import { logoutUser } from "./users";

export const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL_PROD!;
  }

  const host = window.location.hostname;

  if (host.includes("localhost")) return process.env.NEXT_PUBLIC_API_URL_LOCAL!;
  if (host.includes("rpi.local")) return process.env.NEXT_PUBLIC_API_URL_LAN!;
  if (host.startsWith("100.")) return process.env.NEXT_PUBLIC_API_URL_TAILSCALE!;

  return process.env.NEXT_PUBLIC_API_URL_PROD!;
};

export const apiFetch = async <T>(
  url: string,
  options?: RequestInit & { allow404?: boolean }
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

  const res = await fetch(`${getApiBaseUrl()}${url}`, {
    ...opts,
    headers,
  });

  if (res.status === 401) {
    logoutUser();

    throw {
      status: 401,
      message: "Session expired",
    };
  }

  if (res.status === 404 && options?.allow404) {
    return null as T;
  }

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!res.ok) {
    let errorData: any = null;

    if (isJson) {
      errorData = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => "");
      errorData = text ? { message: text } : null;
    }

    throw {
      status: res.status,
      message: errorData?.message ?? "API error",
    };
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!isJson) {
    const text = await res.text().catch(() => "");
    return (text ? text : undefined) as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
};