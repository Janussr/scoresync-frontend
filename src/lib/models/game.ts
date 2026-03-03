import { Score } from "./score";

export interface Winner {
  userId: number;
  userName: string;
  winningScore: number;
  winDate: string;
}

export interface GameDetails {
  id: number;
  gameNumber: number;
  startedAt: string;
  endedAt?: string;
  isFinished: boolean;
  scores: Score[];
  winner?: Winner | null;
}

export interface PlayerScoreDetails {
  userId: number;
  userName: string;
  totalPoints: number;
  entries: Score[];
}

export interface Game {
  id: number;
  gameNumber: number;
  startedAt: string;
  endedAt?: string;
  isFinished: boolean;
  rebuyValue: number;
  bountyValue: number;
  participants: Participant[];
  scores: Score[];
  winner?: Winner | null;
}

export interface Participant {
  userId: number;
  userName: string;
  rebuyCount: number;
  activeBounties: number;
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