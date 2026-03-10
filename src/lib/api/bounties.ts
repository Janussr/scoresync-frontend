import { apiFetch } from "./clients";
import { BountyRow } from "@/lib/models/game";

export const registerKnockout = (gameId: number, victimUserId: number) =>
  apiFetch(`/bounties/${gameId}/bounty`, {
    method: "POST",
    body: { victimUserId } as any,
  });

  export const registerAdminKnockout = (gameId: number, killerUserId: number, victimUserId: number) =>
  apiFetch(`/bounties/${gameId}/admin/bounty`, {
    method: "POST",
    body: { killerUserId, victimUserId } as any,
  });

  export const getKnockoutLeaderboard = () =>
  apiFetch<BountyRow[]>(`/bounties/bounty-leaderboard`);