export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch {
    return true;
  }
}

export const apiFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const opts: RequestInit = { ...options };

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

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...opts,
    headers,
  });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (null as unknown as T);
};