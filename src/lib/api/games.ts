import { apiFetch } from "./clients";
import {  Game, GameDetails, HallOfFameEntry  } from "@/lib/models/game";

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

  export const removeGame = (gameId: number) =>
  apiFetch<void>(`/games/remove/${gameId}`, {
    method: "DELETE",
  });

export const updateRules = (gameId: number, rebuyValue: number, bountyValue: number) =>
  apiFetch(`/games/${gameId}/rules`, {
    method: "PATCH",
    body: { rebuyValue, bountyValue } as any,
  });
