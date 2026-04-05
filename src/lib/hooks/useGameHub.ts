"use client";

import { useEffect, useRef } from "react";
import { Game, RoundDto } from "@/lib/models/game";
import {
  getGameHubConnection,
  joinedGameRefs,
  startGameHub,
} from "./gameHubClient";
import { KnockoutTargetsUpdatedDto, KnockoutUpdatedDto } from "../models/bounty";

type UseGameHubProps = {
  gameId?: number;
  onGameUpdated?: (game: Game) => void;
  onRoundStarted?: (round: RoundDto) => void;
  onGameFinished?: (gameId: number) => void;
  onKnockout?: (knockout: KnockoutUpdatedDto) => void;
   onKnockoutTargetsUpdated?: (payload: KnockoutTargetsUpdatedDto) => void;
};

export function useGameHub({
  gameId,
  onGameUpdated,
  onRoundStarted,
  onGameFinished,
  onKnockout,
  onKnockoutTargetsUpdated,
}: UseGameHubProps) {
  const handlersRef = useRef({
    onGameUpdated,
    onRoundStarted,
    onGameFinished,
    onKnockout,
    onKnockoutTargetsUpdated,
  });

  useEffect(() => {
    handlersRef.current = {
      onGameUpdated,
      onRoundStarted,
      onGameFinished,
      onKnockout,
      onKnockoutTargetsUpdated
    };
  }, [onGameUpdated, onRoundStarted,  onGameFinished, onKnockout, onKnockoutTargetsUpdated]);

  useEffect(() => {
    const connection = getGameHubConnection();

    const handleGameUpdated = (game: Game) => {
      handlersRef.current.onGameUpdated?.(game);
    };

    const handleRoundStarted = (round: RoundDto) => {
      console.log("▶️ Round started", round);
      handlersRef.current.onRoundStarted?.(round);
    };

    const handleGameFinished = (finishedGameId: number) => {
      console.log("🏁 Game finished", finishedGameId);
      handlersRef.current.onGameFinished?.(finishedGameId);
    };

    const handleKnockoutUpdated = (knockout: KnockoutUpdatedDto) => {
      console.log ("Registered knockout", knockout);
      handlersRef.current.onKnockout?.(knockout);
    }

    const onKnockoutTargetsUpdated = (payload: KnockoutTargetsUpdatedDto) => {
      console.log ("Player joined / left", payload)
      handlersRef.current.onKnockoutTargetsUpdated?.(payload)
    }

    connection.on("GameUpdated", handleGameUpdated);
    connection.on("RoundStarted", handleRoundStarted);
    connection.on("GameFinished", handleGameFinished);
    connection.on("KnockoutUpdated", handleKnockoutUpdated);
    connection.on("KnockoutTargetsUpdated", onKnockoutTargetsUpdated);

    return () => {
      connection.off("GameUpdated", handleGameUpdated);
      connection.off("RoundStarted", handleRoundStarted);
      connection.off("GameFinished", handleGameFinished);
      connection.off("KnockoutUpdated", handleKnockoutUpdated);
      connection.off("KnockoutTargetsUpdated", onKnockoutTargetsUpdated);
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