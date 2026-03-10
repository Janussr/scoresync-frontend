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

export const getAllGames = () =>
  apiFetch<Game[]>(`/games`);

export const getActiveGame = () =>
  apiFetch<Game | null>(`/games/active/game`);

export const getHallOfFame = () =>
  apiFetch<HallOfFameEntry[]>(`/halloffame`);

// export const getPlayerScoreDetails = (gameId: number, userId: number) =>
//   apiFetch<PlayerScoreDetails>(`/scores/${gameId}/players/${userId}/scores`);


// export const addScore = (gameId: number, userId: number, value: number) =>
//   apiFetch<PlayerScoreDetails>(`/scores/${gameId}/score`, {
//     method: "POST",
//     body: { userId, value } as any, 
//   });

//   export const addPointsBulk = (gameId: number, scores: { userId: number; points: number }[]) =>
//   apiFetch<Score[]>(`/scores/${gameId}/points/bulk`, {
//     method: "POST",
//     body: JSON.stringify({ gameId, scores }),
//   });

//   export const removePoints = (pointId: number) =>
//   apiFetch<Participant[]>(`/scores/points/${pointId}`, {
//     method: "DELETE",
//   });

// export const addParticipants = (gameId: number, userIds: number[]) =>
//   apiFetch<Participant[]>(`/participants/${gameId}`, {
//     method: "POST",
//     body: { userIds } as any,
//   });

// export const removeParticipant = (gameId: number, userId: number) =>
//   apiFetch<Participant[]>(`/participants/${gameId}/participants/${userId}`, {
//     method: "DELETE",
//   });

  export const removeGame = (gameId: number) =>
  apiFetch<void>(`/games/remove/${gameId}`, {
    method: "DELETE",
  });

export const updateRules = (gameId: number, rebuyValue: number, bountyValue: number) =>
  apiFetch(`/games/${gameId}/rules`, {
    method: "PATCH",
    body: { rebuyValue, bountyValue } as any,
  });

// export const rebuy = (gameId: number) =>
//   apiFetch(`/scores/${gameId}/rebuy`, { method: "POST" });

// export const adminRebuy = (gameId: number, userId: number) =>
//   apiFetch(`/scores/${gameId}/admin/rebuy`, {
//     method: "POST",    
//     body: JSON.stringify(userId)
//   });

// export const registerKnockout = (gameId: number, victimUserId: number) =>
//   apiFetch(`/bounties/${gameId}/bounty`, {
//     method: "POST",
//     body: { victimUserId } as any,
//   });

//   export const registerAdminKnockout = (gameId: number, killerUserId: number, victimUserId: number) =>
//   apiFetch(`/bounties/${gameId}/admin/bounty`, {
//     method: "POST",
//     body: { killerUserId, victimUserId } as any,
//   });

//   export const getKnockoutLeaderboard = () =>
//   apiFetch<BountyRow[]>(`/bounties/bounty-leaderboard`);