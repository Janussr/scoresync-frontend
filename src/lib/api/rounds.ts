import { apiFetch } from "./clients";
import { RoundDto } from "@/lib/models/game";

// Start a new round for a given game
export const startRound = (gameId: number) =>
  apiFetch<RoundDto>(`/rounds/${gameId}/rounds/start`, { method: "POST" });

// Get the current active round for a game
export const getCurrentRound = (gameId: number) =>
  apiFetch<RoundDto | null>(`/rounds/${gameId}/current`);

// End a specific round
// export const endRound = (roundId: number) =>
//   apiFetch<RoundDto>(`/rounds/${roundId}/end`, { method: "POST" });