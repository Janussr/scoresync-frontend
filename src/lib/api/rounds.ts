import { apiFetch } from "./clients";
import { RoundDto } from "@/lib/models/game";

// Start a new round for a given game and automatically ends the previous round
export const startRound = (gameId: number) =>
  apiFetch<RoundDto>(`/rounds/${gameId}/rounds/start`, { method: "POST" });

