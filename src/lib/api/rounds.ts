import { apiFetch } from "./clients";
import { RoundDto } from "@/lib/models/game";

export const startRound = (gameId: number) =>
  apiFetch<RoundDto>(`/rounds/${gameId}/rounds/start`, { method: "POST" });

