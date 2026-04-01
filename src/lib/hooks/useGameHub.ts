"use client";

import { useEffect, useRef } from "react";
import { Game, RoundDto } from "@/lib/models/game";
import {
  getGameHubConnection,
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

  useEffect(() => {
    handlersRef.current = {
      onGameUpdated,
      onRoundStarted,
      onRoundEnded,
      onGameFinished,
    };
  }, [onGameUpdated, onRoundStarted, onRoundEnded, onGameFinished]);

  useEffect(() => {
    const connection = getGameHubConnection();

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

    connection.on("GameUpdated", handleGameUpdated);
    connection.on("RoundStarted", handleRoundStarted);
    connection.on("RoundEnded", handleRoundEnded);
    connection.on("GameFinished", handleGameFinished);

    return () => {
      connection.off("GameUpdated", handleGameUpdated);
      connection.off("RoundStarted", handleRoundStarted);
      connection.off("RoundEnded", handleRoundEnded);
      connection.off("GameFinished", handleGameFinished);
    };
  }, []);

  useEffect(() => {
    if (!gameId) return;

    const connection = getGameHubConnection();
    let cancelled = false;

    const init = async () => {
      await startGameHub();
      if (cancelled) return;

      const currentRefCount = joinedGameRefs.get(gameId) || 0;
      joinedGameRefs.set(gameId, currentRefCount + 1);

      if (currentRefCount === 0) {
        await connection.invoke("JoinGameGroup", gameId);
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

        if (connection.state === "Connected") {
          connection
            .invoke("LeaveGameGroup", gameId)
            .then(() => {
              console.log(`👋 Left GameGroup ${gameId}`);
            })
            .catch((err) => {
              console.error(`❌ Failed to leave GameGroup ${gameId}`, err);
            });
        }
      } else {
        joinedGameRefs.set(gameId, currentRefCount - 1);
        console.log(
          `ℹ️ Decremented GameGroup ${gameId} refCount to ${currentRefCount - 1}`
        );
      }
    };
  }, [gameId]);
}