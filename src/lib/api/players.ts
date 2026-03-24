import { apiFetch } from "./clients";
import { Player } from "@/lib/models/game";



export const AddPlayersToGameAsAdmin = (gameId: number, userIds: number[]) =>
  apiFetch<Player[]>(`/players/${gameId}`, {
    method: "POST",
    body: { userIds } as any,
  });

export const removePlayer = (gameId: number, userId: number) =>
  apiFetch<Player[]>(`/players/${gameId}/player/${userId}`, {
    method: "DELETE",
  });