import { apiFetch } from "./clients";
import { BountyRow, Game, GameDetails, HallOfFameEntry, Participant } from "@/lib/models/game";
import { PlayerScoreDetails, Score } from "@/lib/models/score";

export const startGame = () =>
  apiFetch<Game>(`/games/start`, { method: "POST" });

export const endGame = (gameId: number) =>
  apiFetch(`/games/${gameId}/end`, { method: "POST" });

export const cancelGame = (gameId: number) =>
  apiFetch(`/games/${gameId}/cancel`, { method: "POST" });

export const getGameDetails = (gameId: number) =>
  apiFetch<GameDetails>(`/games/${gameId}`);

export const getPlayerScoreDetails = (gameId: number, userId: number) =>
  apiFetch<PlayerScoreDetails>(`/games/${gameId}/players/${userId}/scores`);

export const getAllGames = () =>
  apiFetch<Game[]>(`/games`);

export const getActiveGame = () =>
  apiFetch<Game | null>(`/games/active/game`);

export const getHallOfFame = () =>
  apiFetch<HallOfFameEntry[]>(`/halloffame`);

export const addScore = (gameId: number, userId: number, value: number) =>
  apiFetch<PlayerScoreDetails>(`/games/${gameId}/score`, {
    method: "POST",
    body: { userId, value } as any, 
  });

  export const addPointsBulk = (gameId: number, scores: { userId: number; points: number }[]) =>
  apiFetch<Score[]>(`/games/${gameId}/points/bulk`, {
    method: "POST",
    body: JSON.stringify({ gameId, scores }),
  });

  export const removePoints = (pointId: number) =>
  apiFetch<Participant[]>(`/games/points/${pointId}`, {
    method: "DELETE",
  });

export const addParticipants = (gameId: number, userIds: number[]) =>
  apiFetch<Participant[]>(`/games/${gameId}/participants`, {
    method: "POST",
    body: { userIds } as any,
  });

export const removeParticipant = (gameId: number, userId: number) =>
  apiFetch<Participant[]>(`/games/${gameId}/participants/${userId}`, {
    method: "DELETE",
  });

  export const removeGame = (gameId: number) =>
  apiFetch<void>(`/games/remove/${gameId}`, {
    method: "DELETE",
  });

export const updateRules = (gameId: number, rebuyValue: number, bountyValue: number) =>
  apiFetch(`/games/${gameId}/rules`, {
    method: "PATCH",
    body: { rebuyValue, bountyValue } as any,
  });

export const rebuy = (gameId: number) =>
  apiFetch(`/games/${gameId}/rebuy`, { method: "POST" });

export const adminRebuy = (gameId: number, userId: number) =>
  apiFetch(`/games/${gameId}/admin/rebuy`, {
    method: "POST",
    body: JSON.stringify(userId)
  });

export const registerKnockout = (gameId: number, victimUserId: number) =>
  apiFetch(`/games/${gameId}/bounty`, {
    method: "POST",
    body: { victimUserId } as any,
  });

  export const registerAdminKnockout = (gameId: number, killerUserId: number, victimUserId: number) =>
  apiFetch(`/games/${gameId}/admin/bounty`, {
    method: "POST",
    body: { killerUserId, victimUserId } as any,
  });

  export const getKnockoutLeaderboard = () =>
  apiFetch<BountyRow[]>(`/games/bounty-leaderboard`);