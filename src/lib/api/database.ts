import { KeepAwakeResponse } from "../models/database";
import { apiFetch } from "./clients";

export async function pingDatabase() {
  return apiFetch("/database/ping", {
    method: "POST",
  });
}

export async function getDatabaseKeepAwakeState() {
  return apiFetch<KeepAwakeResponse>("/database/keep-awake");
}

export async function setDatabaseKeepAwake(enabled: boolean) {
  return apiFetch<KeepAwakeResponse>("/database/keep-awake", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}