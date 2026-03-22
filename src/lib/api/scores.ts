import { apiFetch } from "./clients";
import { BountyRow, Game, GameDetails, HallOfFameEntry, Player } from "@/lib/models/game";
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
  apiFetch<Player[]>(`/scores/points/${pointId}`, {
    method: "DELETE",
  });

export const getPlayerScoreDetails = (gameId: number, userId: number) =>
  apiFetch<PlayerScoreDetails>(`/scores/${gameId}/players/${userId}/scores`);


// export const rebuy = (gameId: number) =>
//   apiFetch(`/scores/${gameId}/rebuy`, { method: "POST" });

export const rebuy = (gameId: number, playerId: number) =>
  apiFetch(`/scores/${gameId}/rebuy`, {
    method: "POST",
    body: { playerId } as any,
  });

export const adminRebuy = async (
  gameId: number,
  actorUserId: number,
  targetUserId: number,
  isAdmin: boolean
) => {
  return await apiFetch(`/scores/${gameId}/rebuy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, actorUserId, targetUserId, isAdmin }),
  });
};