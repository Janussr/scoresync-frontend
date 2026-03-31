import { Score } from "./score";

export interface Winner {
  userId: number;
  userName: string;
  winningScore: number;
  winDate: string;
}

export type GameType = "BlackJack" | "Poker" | "Roullette";

export interface GameDetails {
  id: number;
  gameNumber: number;
  startedAt: string;
  endedAt?: string;
  isFinished: boolean;
  scores: Score[];
  winner?: Winner | null;
  type: GameType;
  players?: Player[];
  rebuyValue?: number;
  bountyValue?: number; 
  rounds?: RoundDto[]; 
}

export interface Game {
  id: number;
  gameNumber: number;
  startedAt: string;
  endedAt?: string;
  isFinished: boolean;
  isOpenForPlayers: boolean;
  rebuyValue: number;
  bountyValue: number;
  players: Player[];
  scores: Score[];
  type: GameType;
  rounds: RoundDto[];
  winner?: Winner | null;
}

export interface GamePanel {
  id: number;
  gameNumber: number;
  startedAt: string;
  isFinished: boolean;
  isOpenForPlayers: boolean;
  rebuyValue: number;
  bountyValue: number;
  players: Player[];
  scores: Score[];
  type: GameType;
  rounds: RoundDto[];
}

export interface Player {
  playerId: number;
  userId: number
  username: string;
  rebuyCount: number;
  activeBounties: number;
  isActive: boolean;
}

export interface HistoryEntry {
  id: number;
  gameNumber: number;
  winnerName: string;
  totalScore: number;
  date: string;
  playerCount: number;
}

export interface HallOfFameEntry {
  userId: number; 
  gameType: GameType;
  playerName: string;
  wins: number;
}

export interface BountyRow {
  userId: number;
  userName: string;
  knockouts: number;
  timesKnockedOut: number;
  totalBountyPoints: number;
}

export interface RoundDto {
  id: number;
  roundNumber: number;
  startedAt: string; 
  endedAt: string | null; 
scores: Score[];
}

