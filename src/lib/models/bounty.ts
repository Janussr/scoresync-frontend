import { Score, ScoreEntryDto } from "./score";

export interface KnockoutUpdatedDto {
  gameId: number;
  killerPlayerId: number;
  victimPlayerId: number;
  killerActiveBounties: number;
  victimActiveBounties: number;
  score: Score;
}

export interface BountyRow {
  userId: number;
  userName: string;
  knockouts: number;
  timesKnockedOut: number;
  totalBountyPoints: number;
}