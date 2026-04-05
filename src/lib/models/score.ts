export type PointsType = "Chips" | "Rebuy" | "Bounty";

export interface Score {
  id: number;
  playerId: number;
  userId: number;
  userName: string;
  points: number;
  createdAt: string;
  totalPoints: number;
  type: PointsType;
  victimUserName: string;
  gameId?: number;        
  roundId?: number; 
  roundNumber: number;
}

export interface RoundScoreDto {
  roundId: number;
  roundNumber: number;
  startedAt: string;
  totalPoints: number;
  entries: ScoreEntryDto[];
}

export interface ScoreEntryDto {
  id: number;
  points: number;
  createdAt: string;
  type: PointsType; 
  victimUserId?: number | null;
  victimUserName?: string | null;
}

export interface Winner {
  userId: number;
  userName: string;
  winningScore: number;
  winDate: string;
}
