import { apiFetch } from "./clients";
import { Player } from "@/lib/models/game";



export const AddPlayersToGameAsAdmin = (gameId: number, userIds: number[]) =>
  apiFetch<Player[]>(`/players/${gameId}`, {
    method: "POST",
    body: { userIds } as any,
  });

  export const leaveGame = (gameId: number) =>
  apiFetch<{ message: string }>(`/players/${gameId}/leave`, {
    method: "POST",
  });

export const removePlayer = (gameId: number, playerID: number) =>
  apiFetch<void>(`/players/${gameId}/player/${playerID}/kick`, {
    method: "POST",
  });