// useGameHub.ts
"use client";

import { useEffect } from "react";
import { Game, RoundDto } from "@/lib/models/game";
import { gameHubConnection } from "./gameHubConnection";

type UseGameHubProps = {
  gameId?: number;
  onGameUpdated?: (game: Game) => void;
  onRoundStarted?: (round: RoundDto) => void;
  onRoundEnded?: (round: RoundDto) => void;
  onGameFinished?: (gameId: number) => void;
};

export function useGameHub({
  gameId,
  onGameUpdated,
  onRoundStarted,
  onRoundEnded,
  onGameFinished,
}: UseGameHubProps) {
  useEffect(() => {
    if (!gameId) return;

    let isMounted = true;

    async function startConnection() {
      try {
        if (gameHubConnection.state === "Disconnected") {
          await gameHubConnection.start();
          console.log("✅ Connected to GameHub (singleton)");
        }

        // Join gruppen for dette gameId
        await gameHubConnection.invoke("JoinGameGroup", gameId);
      } catch (err) {
        console.error("❌ SignalR start error:", err);
      }
    }

    startConnection();

    // ----------------- EVENTS -----------------
    const handleGameFinished = (finishedGameId: number) => {
      if (!isMounted) return;
      console.log("🏁 Game finished", finishedGameId);
      onGameFinished?.(finishedGameId);
    };

    const handleGameUpdated = (game: Game) => {
      if (!isMounted) return;
      onGameUpdated?.(game);
    };

    const handleRoundStarted = (round: RoundDto) => {
      if (!isMounted) return;
      console.log("▶️ Round started:", round);
      onRoundStarted?.(round);
    };

    const handleRoundEnded = (round: RoundDto) => {
      if (!isMounted) return;
      console.log("⏹ Round ended:", round);
      onRoundEnded?.(round);
    };

    gameHubConnection.on("GameFinished", handleGameFinished);
    gameHubConnection.on("GameUpdated", handleGameUpdated);
    gameHubConnection.on("RoundStarted", handleRoundStarted);
    gameHubConnection.on("RoundEnded", handleRoundEnded);

    return () => {
      isMounted = false;
      gameHubConnection.off("GameFinished", handleGameFinished);
      gameHubConnection.off("GameUpdated", handleGameUpdated);
      gameHubConnection.off("RoundStarted", handleRoundStarted);
      gameHubConnection.off("RoundEnded", handleRoundEnded);

      // Leave group, men lad connection blive — singletonen reconnecter selv
      if (gameHubConnection.state === "Connected") {
        gameHubConnection.invoke("LeaveGameGroup", gameId).catch(() => {});
      }
    };
  }, [gameId, onGameUpdated, onRoundStarted, onRoundEnded, onGameFinished]);
}