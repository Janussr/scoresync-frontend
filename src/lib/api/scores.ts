import { apiFetch } from "./clients";
import { BountyRow, Game, GameDetails, HallOfFameEntry, Player } from "@/lib/models/game";
import { PlayerScoreDetails, Score } from "@/lib/models/score";


// Kun til player siden – current user kan kun tilføje points til sig selv
export const addScorePlayer = (gameId: number, value : number) =>
  apiFetch<PlayerScoreDetails>(`/scores/player/addscore`, {
    method: "POST",
    body: { gameId, value  } as any,
  });

// Til admin/GameControl
export const addScoreAdmin = (gameId: number, targetPlayerId: number, value: number) =>
  apiFetch<PlayerScoreDetails>(`/scores/admin/addscore`, {
    method: "POST",
    body: { gameId, targetPlayerId, value }as any,
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


export const rebuyAsPlayer = (gameId: number) =>
  apiFetch<Score>(`/scores/${gameId}/player/rebuy`, { method: "POST" });

export const rebuyAsAdmin = (gameId: number, targetPlayerId: number) =>
  apiFetch(`/scores/${gameId}/admin/rebuy`, {
    method: "POST",
    body: targetPlayerId as any, 
  });