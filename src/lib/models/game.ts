import { Player } from "./player";
import { Score } from "./score";

export type GameType = "BlackJack" | "Poker" | "Roulette";

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

export interface GameListItemDto {
  id: number;
  gameNumber: number;
  startedAt?: string;
  endedAt?: string;
  isFinished: boolean;
  type: GameType;
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

export interface GameHistoryEntry {
  id: number;
  gameNumber: number;
  winnerName: string;
  date: string;
  playerCount: number;
  type: GameType;
  roundCount: number;
}

export interface HallOfFameEntry {
  userId: number; 
  gameType: GameType;
  playerName: string;
  wins: number;
}

export interface RoundDto {
  id: number;
  roundNumber: number;
  startedAt: string; 
  endedAt: string | null; 
scores: Score[];
}


export interface ActivePlayerGame {
  id: number;
  gameNumber: number;
  startedAt: string;
  endedAt?: string;
  isFinished: boolean;
  type: GameType;
  rebuyValue?: number;
  bountyValue?: number;
  me: {
    playerId: number;
    userId: number;
    username: string;
    rebuyCount: number;
    activeBounties: number;
  };
  knockoutTargets: {
    playerId: number;
    username: string;
    activeBounties: number;
  }[];
  rounds: RoundDto[]
}


export interface RulesUpdatedDto {
  gameId: number;
  rebuyValue: number | null;
  bountyValue: number | null;
};
