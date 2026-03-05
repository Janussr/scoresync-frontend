export const API_BASE_URL = "http://localhost:5279/api";


function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch {
    return true;
  }
}

//Hvis du laver API-funktioner i lib/api/*.ts, brug apiFetch.
//Hvis du laver direkte API-kald i en komponent og vil reagere på token + logout automatisk, brug useApi.
export const apiFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const opts: RequestInit = { ...options };
  
  // Hvis body er objekt, gør det til JSON
  if (opts.body && typeof opts.body === "object") {
    opts.body = JSON.stringify(opts.body);
  }

  // Headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };

  //Hent token fra localStorage og sæt Authorization header
 const token = localStorage.getItem("token");

if (token) {
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Token expired");
  }

  headers["Authorization"] = `Bearer ${token}`;
}

  const res = await fetch(`${API_BASE_URL}${url}`, { ...opts, headers });

 if (res.status === 401) {
  localStorage.removeItem("token");

  window.location.href = "/login";

  throw new Error("Session expired");
}

if (!res.ok) {
  const text = await res.text();
  throw new Error(text || "API error");
}

  const text = await res.text();
  return text ? JSON.parse(text) : (null as unknown as T);
};