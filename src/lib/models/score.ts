export interface Score {
  id: number;
  playerId: number;
  userId: number;
  userName: string;
  points: number;
  createdAt: string;
  totalPoints: number;
  type: "Chips" | "Rebuy" | "Bounty";
  victimUserName: string;
  gameId?: number;        
  roundId?: number; 
}


export interface PlayerScoreDetails {
  userId: number;
  playerId: number;
  userName: string;
  totalPoints: number;
  rounds: RoundScoreDto[]; 
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
  type: "Chips" | "Rebuy" | "Bounty"; 
  victimUserId?: number | null;
  victimUserName?: string | null;
}


export interface Winner {
  userId: number;
  userName: string;
  winningScore: number;
  winDate: string;
}
