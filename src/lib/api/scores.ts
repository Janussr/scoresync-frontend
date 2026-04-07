import { PlayerScoreDetails, Player } from "../models/player";
import { Score, AddScoreResponse } from "../models/score";
import { apiFetch } from "./clients";


// Kun til player siden – current user kan kun tilføje points til sig selv
export const addScorePlayer = (gameId: number, value : number) =>
  apiFetch<AddScoreResponse>(`/scores/player/addscore`, {
    method: "POST",
    body: { gameId, value  } as any,
  });

// Til admin/GameControl
export const addScoreAdmin = (gameId: number, targetPlayerId: number, value: number) =>
  apiFetch<Score>(`/scores/admin/addscore`, {
    method: "POST",
    body: { gameId, targetPlayerId, value }as any,
  });

  export const addPointsBulk = (gameId: number, scores: { playerId: number; points: number }[]) =>
  apiFetch<Score[]>(`/scores/${gameId}/points/bulk`, {
    method: "POST",
    body: JSON.stringify({ gameId, scores }),
  });

  export const removePoints = (pointId: number) =>
  apiFetch<Player[]>(`/scores/points/${pointId}`, {
    method: "DELETE",
  });

export const getPlayerGameScoreDetails = (gameId: number, playerId: number) =>
  apiFetch<PlayerScoreDetails>(`/scores/${gameId}/players/${playerId}/scores`);


export const rebuyAsPlayer = (gameId: number) =>
  apiFetch<AddScoreResponse>(`/scores/${gameId}/player/rebuy`, { method: "POST" });

export const rebuyAsAdmin = (gameId: number, targetPlayerId: number) =>
  apiFetch<Score>(`/scores/${gameId}/admin/rebuy`, {
    method: "POST",
    body: targetPlayerId as any, 
  });