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
  userName: string;
  totalPoints: number;
  entries: Score[];
}


export interface Winner {
  userId: number;
  userName: string;
  winningScore: number;
  winDate: string;
}
