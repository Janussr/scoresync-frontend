import { BountyRow } from "../models/bounty";
import { apiFetch } from "./clients";

export const registerPlayerKnockout = (gameId: number, victimPlayerId: number) =>
  apiFetch(`/bounties/player/knockout`, {
    method: "POST",
    body: { gameId, victimPlayerId }as any,
  });

export const registerAdminKnockout = (
  gameId: number,
  killerPlayerId: number,
  victimPlayerId: number
) =>
  apiFetch(`/bounties/admin/knockout`, {
    method: "POST",
    body: { gameId, killerPlayerId, victimPlayerId }as any,
  });

  export const getKnockoutLeaderboard = () =>
  apiFetch<BountyRow[]>(`/bounties/bounty-leaderboard`);