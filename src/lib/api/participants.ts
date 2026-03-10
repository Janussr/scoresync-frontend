import { apiFetch } from "./clients";
import { BountyRow, Game, GameDetails, HallOfFameEntry, Participant } from "@/lib/models/game";
import { PlayerScoreDetails, Score } from "@/lib/models/score";



export const addParticipants = (gameId: number, userIds: number[]) =>
  apiFetch<Participant[]>(`/participants/${gameId}`, {
    method: "POST",
    body: { userIds } as any,
  });

export const removeParticipant = (gameId: number, userId: number) =>
  apiFetch<Participant[]>(`/participants/${gameId}/participants/${userId}`, {
    method: "DELETE",
  });