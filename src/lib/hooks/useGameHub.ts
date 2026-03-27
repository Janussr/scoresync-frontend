"use client";

import { useEffect, useRef } from "react";
import { Game, RoundDto } from "@/lib/models/game";
import {
  gameHubConnection,
  joinedGameRefs,
  startGameHub,
} from "./gameHubClient";

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
  const handlersRef = useRef({
    onGameUpdated,
    onRoundStarted,
    onRoundEnded,
    onGameFinished,
  });

  // Hold callbacks opdateret uden at trigge leave/join
  useEffect(() => {
    handlersRef.current = {
      onGameUpdated,
      onRoundStarted,
      onRoundEnded,
      onGameFinished,
    };
  }, [onGameUpdated, onRoundStarted, onRoundEnded, onGameFinished]);

  // Registrer SignalR event handlers én gang
  useEffect(() => {
    const handleGameUpdated = (game: Game) => {
      handlersRef.current.onGameUpdated?.(game);
    };

    const handleRoundStarted = (round: RoundDto) => {
      console.log("▶️ Round started", round);
      handlersRef.current.onRoundStarted?.(round);
    };

    const handleRoundEnded = (round: RoundDto) => {
      console.log("⏹️ Round ended", round);
      handlersRef.current.onRoundEnded?.(round);
    };

    const handleGameFinished = (finishedGameId: number) => {
      console.log("🏁 Game finished", finishedGameId);
      handlersRef.current.onGameFinished?.(finishedGameId);
    };

    gameHubConnection.on("GameUpdated", handleGameUpdated);
    gameHubConnection.on("RoundStarted", handleRoundStarted);
    gameHubConnection.on("RoundEnded", handleRoundEnded);
    gameHubConnection.on("GameFinished", handleGameFinished);

    return () => {
      gameHubConnection.off("GameUpdated", handleGameUpdated);
      gameHubConnection.off("RoundStarted", handleRoundStarted);
      gameHubConnection.off("RoundEnded", handleRoundEnded);
      gameHubConnection.off("GameFinished", handleGameFinished);
    };
  }, []);

  // Join/leave kun når gameId ændrer sig
  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;

    const init = async () => {
      await startGameHub();
      if (cancelled) return;

      const currentRefCount = joinedGameRefs.get(gameId) || 0;
      joinedGameRefs.set(gameId, currentRefCount + 1);

      if (currentRefCount === 0) {
        await gameHubConnection.invoke("JoinGameGroup", gameId);
        console.log(`▶️ Joined GameGroup ${gameId}`);
      } else {
        console.log(
          `ℹ️ GameGroup ${gameId} already joined, refCount=${currentRefCount + 1}`
        );
      }
    };

    init().catch((err) => {
      console.error("❌ Failed to initialize GameHub", err);
    });

    return () => {
      cancelled = true;

      const currentRefCount = joinedGameRefs.get(gameId);
      if (!currentRefCount) return;

      if (currentRefCount === 1) {
        joinedGameRefs.delete(gameId);

        gameHubConnection
          .invoke("LeaveGameGroup", gameId)
          .then(() => {
            console.log(`👋 Left GameGroup ${gameId}`);
          })
          .catch((err) => {
            console.error(`❌ Failed to leave GameGroup ${gameId}`, err);
          });
      } else {
        joinedGameRefs.set(gameId, currentRefCount - 1);
        console.log(
          `ℹ️ Decremented GameGroup ${gameId} refCount to ${currentRefCount - 1}`
        );
      }
    };
  }, [gameId]);
}