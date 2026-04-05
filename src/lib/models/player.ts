import { RoundScoreDto } from "./score";

export interface PlayerScoreDetails {
  userId: number;
  playerId: number;
  userName: string;
  totalPoints: number;
  rounds: RoundScoreDto[]; 
}

export interface Player {
  playerId: number;
  userId: number
  username: string;
  rebuyCount: number;
  activeBounties: number;
  isActive: boolean;
}