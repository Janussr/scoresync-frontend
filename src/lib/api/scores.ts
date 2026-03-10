import { apiFetch } from "./clients";
import { BountyRow, Game, GameDetails, HallOfFameEntry, Participant } from "@/lib/models/game";
import { PlayerScoreDetails, Score } from "@/lib/models/score";


export const addScore = (gameId: number, userId: number, value: number) =>
  apiFetch<PlayerScoreDetails>(`/scores/${gameId}/score`, {
    method: "POST",
    body: { userId, value } as any, 
  });

  export const addPointsBulk = (gameId: number, scores: { userId: number; points: number }[]) =>
  apiFetch<Score[]>(`/scores/${gameId}/points/bulk`, {
    method: "POST",
    body: JSON.stringify({ gameId, scores }),
  });

  export const removePoints = (pointId: number) =>
  apiFetch<Participant[]>(`/scores/points/${pointId}`, {
    method: "DELETE",
  });

export const getPlayerScoreDetails = (gameId: number, userId: number) =>
  apiFetch<PlayerScoreDetails>(`/scores/${gameId}/players/${userId}/scores`);


export const rebuy = (gameId: number) =>
  apiFetch(`/scores/${gameId}/rebuy`, { method: "POST" });

export const adminRebuy = (gameId: number, userId: number) =>
  apiFetch(`/scores/${gameId}/admin/rebuy`, {
    method: "POST",    
    body: JSON.stringify(userId)
  });