import { apiFetch } from "./clients";

export async function pingDatabase() {
  return apiFetch("/database/ping", {
    method: "POST",
  });
}