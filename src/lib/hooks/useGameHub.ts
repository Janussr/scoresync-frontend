"use client";

import { useEffect, useMemo, useRef } from "react";
import { Game, RoundDto, RulesUpdatedDto } from "@/lib/models/game";
import {
  getGameHubConnection,
  joinedGameRefs,
  startGameHub,
} from "./gameHubClient";
import { KnockoutTargetsUpdatedDto, KnockoutUpdatedDto } from "../models/bounty";
import { PlayerJoinedDto, PlayerLeftDto, PlayerRemovedDto } from "../models/player";

type UseGameHubProps = {
  gameId?: number;
  gameIds?: number[],
  onGameUpdated?: (game: Game) => void;
  onRoundStarted?: (round: RoundDto) => void;
  onGameFinished?: (gameId: number) => void;
  onKnockout?: (knockout: KnockoutUpdatedDto) => void;
  onKnockoutTargetsUpdated?: (payload: KnockoutTargetsUpdatedDto) => void;
  onPlayerRemoved?: (payload: PlayerRemovedDto) => void;
  onRulesUpdated?: (payload: RulesUpdatedDto) => void;
  onPlayerJoined?: (payload: PlayerJoinedDto) => void;
  onPlayerLeft?: (payload: PlayerLeftDto) => void;
};

export function useGameHub({
  gameId,
  gameIds,
  onGameUpdated,
  onRoundStarted,
  onGameFinished,
  onKnockout,
  onKnockoutTargetsUpdated,
  onPlayerRemoved,
  onRulesUpdated,
  onPlayerJoined,
  onPlayerLeft,
}: UseGameHubProps) {
  const handlersRef = useRef({
    onGameUpdated,
    onRoundStarted,
    onGameFinished,
    onKnockout,
    onKnockoutTargetsUpdated,
    onPlayerRemoved,
    onRulesUpdated,
    onPlayerJoined,
    onPlayerLeft,
  });

  const effectiveGameIds = useMemo(() => {
    if (gameIds && gameIds.length > 0) {
      return [...new Set(gameIds)].sort((a, b) => a - b);
    }

    if (gameId) {
      return [gameId];
    }

    return [];
  }, [gameId, gameIds]);

  const gameIdsKey = effectiveGameIds.join(",");

  useEffect(() => {
    handlersRef.current = {
      onGameUpdated,
      onRoundStarted,
      onGameFinished,
      onKnockout,
      onKnockoutTargetsUpdated,
      onPlayerRemoved,
      onRulesUpdated,
      onPlayerJoined,
      onPlayerLeft,
    };
  }, [onGameUpdated, onRoundStarted, onGameFinished, onKnockout, onKnockoutTargetsUpdated, onPlayerRemoved, onRulesUpdated, onPlayerJoined, onPlayerLeft]);

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
      console.log("Registered knockout", knockout);
      handlersRef.current.onKnockout?.(knockout);
    }

    const onKnockoutTargetsUpdated = (payload: KnockoutTargetsUpdatedDto) => {
      console.log("Player joined / left", payload)
      handlersRef.current.onKnockoutTargetsUpdated?.(payload)
    }

    const handlePlayerRemoved = (payload: PlayerRemovedDto) => {
      console.log("Player removed", payload);
      handlersRef.current.onPlayerRemoved?.(payload);
    };

    const handleRulesUpdated = (payload: RulesUpdatedDto) => {
      console.log("Rules updated", payload);
      handlersRef.current.onRulesUpdated?.(payload);
    };

    const handlePlayerJoined = (payload: PlayerJoinedDto) => {
      console.log("Player joined", payload);
      handlersRef.current.onPlayerJoined?.(payload);
    };

const handlePlayerLeft = (payload: PlayerLeftDto) => {
  console.log("Player left", payload);
  handlersRef.current.onPlayerLeft?.(payload);
};


    connection.on("KnockoutTargetsUpdated", onKnockoutTargetsUpdated); //The list of players to knockout
    connection.on("GameUpdated", handleGameUpdated);
    connection.on("RoundStarted", handleRoundStarted);
    connection.on("GameFinished", handleGameFinished);
    connection.on("KnockoutUpdated", handleKnockoutUpdated);
    connection.on("PlayerRemoved", handlePlayerRemoved);
    connection.on("RulesUpdated", handleRulesUpdated);
    connection.on("PlayerJoined", handlePlayerJoined);
connection.on("PlayerLeft", handlePlayerLeft);

    return () => {
      connection.off("KnockoutTargetsUpdated", onKnockoutTargetsUpdated); //The list of players to knockout
      connection.off("GameUpdated", handleGameUpdated);
      connection.off("RoundStarted", handleRoundStarted);
      connection.off("GameFinished", handleGameFinished);
      connection.off("KnockoutUpdated", handleKnockoutUpdated);
      connection.off("PlayerRemoved", handlePlayerRemoved)
      connection.off("RulesUpdated", handleRulesUpdated);
      connection.off("PlayerJoined", handlePlayerJoined);
      connection.off("PlayerLeft", handlePlayerLeft);
    };
  }, []);

  useEffect(() => {
    if (effectiveGameIds.length === 0) return;

    const connection = getGameHubConnection();
    let cancelled = false;

    const ids = [...effectiveGameIds];

    const init = async () => {
      await startGameHub();
      if (cancelled) return;

      for (const id of ids) {
        const currentRefCount = joinedGameRefs.get(id) || 0;
        joinedGameRefs.set(id, currentRefCount + 1);

        if (currentRefCount === 0) {
          await connection.invoke("JoinGameGroup", id);
          console.log(`▶️ Joined GameGroup ${id}`);
        } else {
          console.log(
            `ℹ️ GameGroup ${id} already joined, refCount=${currentRefCount + 1}`
          );
        }
      }
    };

    init().catch((err) => {
      console.error("❌ Failed to initialize GameHub", err);
    });

    return () => {
      cancelled = true;

      for (const id of ids) {
        const currentRefCount = joinedGameRefs.get(id);
        if (!currentRefCount) continue;

        if (currentRefCount === 1) {
          joinedGameRefs.delete(id);

          if (connection.state === "Connected") {
            connection
              .invoke("LeaveGameGroup", id)
              .then(() => {
                console.log(`👋 Left GameGroup ${id}`);
              })
              .catch((err) => {
                console.error(`❌ Failed to leave GameGroup ${id}`, err);
              });
          }
        } else {
          joinedGameRefs.set(id, currentRefCount - 1);
          console.log(
            `ℹ️ Decremented GameGroup ${id} refCount to ${currentRefCount - 1}`
          );
        }
      }
    };
  }, [gameIdsKey]);
}