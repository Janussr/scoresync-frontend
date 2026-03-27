"use client";

import { useEffect } from "react";
import {
  gameHubConnection,
  startGameHub,
  setGameHubHandlers,
} from "./gameHubClient";
import { Game, RoundDto } from "@/lib/models/game";

type UseGameHubProps = {
  gameId?: number;
  onGameUpdated?: (game: Game) => void;
  onRoundStarted?: (round: RoundDto) => void;
  // onRoundEnded?: (round: RoundDto) => void;
  onGameFinished?: (gameId: number) => void;
};

export function useGameHub({
  gameId,
  onGameUpdated,
  onRoundStarted,
  // onRoundEnded,
  onGameFinished,
}: UseGameHubProps) {
  useEffect(() => {
    if (!gameId) return;

    let isMounted = true;

    async function init() {
      await startGameHub();

      if (!isMounted) return;

      if (gameHubConnection.state === "Connected") {
        await gameHubConnection.invoke("JoinGameGroup", gameId);
      }

      // sæt handlers (overskriver gamle → ingen duplicates)
      setGameHubHandlers({
        onGameUpdated,
        onRoundStarted,
        // onRoundEnded,
        onGameFinished,
      });
    }

    init();

    return () => {
      isMounted = false;

      if (gameHubConnection.state === "Connected") {
        gameHubConnection.invoke("LeaveGameGroup", gameId).catch(() => {});
      }

      // fjern handlers (vigtigt!)
      setGameHubHandlers({});
    };
  }, [gameId, onGameUpdated, onRoundStarted,  onGameFinished]);
}