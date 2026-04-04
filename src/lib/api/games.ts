import { apiFetch } from "./clients";
import {  Game, GameDetails, GamePanel, GameType, HallOfFameEntry, GameHistoryEntry  } from "@/lib/models/game";

export const startGame = (type: GameType) =>
  apiFetch<Game>(`/games/start`, {
    method: "POST",
    body: { type } as any,
  });

export const openGameForPlayers = (gameId: number) =>
  apiFetch(`/games/${gameId}/open`, { method: "POST" });

export const endGame = (gameId: number) =>
  apiFetch(`/games/${gameId}/end`, { method: "POST" });

export const cancelGame = (gameId: number) =>
  apiFetch(`/games/${gameId}/cancel`, { method: "POST" });

export const getGameDetails = (gameId: number) =>
  apiFetch<GameDetails>(`/games/${gameId}`);

export const getAllGames = () =>
  apiFetch<Game[]>(`/games`);

export const getGamesHistoryPage = () =>
  apiFetch<GameHistoryEntry[]>(`/games/history-page`);

export const getActiveGames = () =>
  apiFetch<Game[] | null>(`/games/active`);

export const getActiveGameForGamePanel = () =>
  apiFetch<GamePanel | null>(`/games/game-panel/active`);

export const getAllActiveGamesForGamePanel = () =>
  apiFetch<GamePanel[]>(`/games/game-panel/active/all`);

export const getActiveGameForPlayerPage = () =>
  apiFetch<GameDetails | null>(`/games/player-page/active`, { allow404: true });

export const getActiveLobbyGames = () =>
  apiFetch<Game[]>(`/games/lobby`);

export const getHallOfFame = () =>
  apiFetch<HallOfFameEntry[]>(`/halloffame`);

  export const removeGame = (gameId: number) =>
  apiFetch<void>(`/games/remove/${gameId}`, {
    method: "DELETE",
  });

export const updateRules = (gameId: number, rebuyValue: number, bountyValue: number) =>
  apiFetch(`/games/${gameId}/rules`, {
    method: "PATCH",
    body: { rebuyValue, bountyValue } as any,
  });

export const joinGameAsPlayer = (gameId: number, targetUserId?: number) =>
  apiFetch(`/games/${gameId}/join`, {
    method: "POST",
    body: targetUserId !== undefined ? JSON.stringify({ targetUserId }) : undefined,
  });

export const leaveGame = (gameId: number, targetUserId?: number) =>
  apiFetch(`/games/${gameId}/leave`, {
    method: "POST",
    body: targetUserId !== undefined ? JSON.stringify({ targetUserId }) : undefined,
  });

