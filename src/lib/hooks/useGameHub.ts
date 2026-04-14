"use client";

import { useEffect, useMemo, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { Game, RoundDto, RulesUpdatedDto } from "@/lib/models/game";
import {
  getGameHubConnection,
  joinedGameRefs,
  startGameHub,
} from "./gameHubClient";
import { KnockoutTargetsUpdatedDto, KnockoutUpdatedDto } from "../models/bounty";
import { PlayerJoinedDto, PlayerLeftDto, PlayerRemovedDto } from "../models/player";
import { RebuyUpdatedDto, ScoreAddedDto } from "../models/score";

type UseGameHubProps = {
  gameId?: number;
  gameIds?: number[];
  onGameUpdated?: (game: Game) => void;
  onRoundStarted?: (round: RoundDto) => void;
  onGameFinished?: (gameId: number) => void;
  onKnockout?: (knockout: KnockoutUpdatedDto) => void;
  onKnockoutTargetsUpdated?: (payload: KnockoutTargetsUpdatedDto) => void;
  onPlayerRemoved?: (payload: PlayerRemovedDto) => void;
  onRulesUpdated?: (payload: RulesUpdatedDto) => void;
  onPlayerJoined?: (payload: PlayerJoinedDto) => void;
  onPlayerLeft?: (payload: PlayerLeftDto) => void;
  onRebuyUpdated?: (payload: RebuyUpdatedDto) => void;
  onScoreAdded?: (payload: ScoreAddedDto) => void;
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
  onRebuyUpdated,
  onScoreAdded,
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
    onRebuyUpdated,
    onScoreAdded,
  });

  const subscribedIdsRef = useRef<Set<number>>(new Set());

  const effectiveGameIds = useMemo(() => {
    if (gameIds && gameIds.length > 0) {
      return [...new Set(gameIds)].sort((a, b) => a - b);
    }

    if (gameId !== undefined) {
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
      onRebuyUpdated,
      onScoreAdded,
    };
  }, [
    onGameUpdated,
    onRoundStarted,
    onGameFinished,
    onKnockout,
    onKnockoutTargetsUpdated,
    onPlayerRemoved,
    onRulesUpdated,
    onPlayerJoined,
    onPlayerLeft,
    onRebuyUpdated,
    onScoreAdded,
  ]);

  useEffect(() => {
    const connection = getGameHubConnection();

    const handleGameUpdated = (game: Game) => {
      handlersRef.current.onGameUpdated?.(game);
    };

    const handleRoundStarted = (round: RoundDto) => {
      handlersRef.current.onRoundStarted?.(round);
    };

    const handleGameFinished = (finishedGameId: number) => {
      handlersRef.current.onGameFinished?.(finishedGameId);
    };

    const handleKnockoutUpdated = (knockout: KnockoutUpdatedDto) => {
      handlersRef.current.onKnockout?.(knockout);
    };

    const handleKnockoutTargetsUpdated = (payload: KnockoutTargetsUpdatedDto) => {
      handlersRef.current.onKnockoutTargetsUpdated?.(payload);
    };

    const handlePlayerRemoved = (payload: PlayerRemovedDto) => {
      handlersRef.current.onPlayerRemoved?.(payload);
    };

    const handleRulesUpdated = (payload: RulesUpdatedDto) => {
      handlersRef.current.onRulesUpdated?.(payload);
    };

    const handlePlayerJoined = (payload: PlayerJoinedDto) => {
      handlersRef.current.onPlayerJoined?.(payload);
    };

    const handlePlayerLeft = (payload: PlayerLeftDto) => {
      handlersRef.current.onPlayerLeft?.(payload);
    };

    const handleRebuyUpdated = (payload: RebuyUpdatedDto) => {
      handlersRef.current.onRebuyUpdated?.(payload);
    };

    const handleScoreAdded = (payload: ScoreAddedDto) => {
      handlersRef.current.onScoreAdded?.(payload);
    };

    connection.on("KnockoutTargetsUpdated", handleKnockoutTargetsUpdated);
    connection.on("GameUpdated", handleGameUpdated);
    connection.on("RoundStarted", handleRoundStarted);
    connection.on("GameFinished", handleGameFinished);
    connection.on("KnockoutUpdated", handleKnockoutUpdated);
    connection.on("PlayerRemoved", handlePlayerRemoved);
    connection.on("RulesUpdated", handleRulesUpdated);
    connection.on("PlayerJoined", handlePlayerJoined);
    connection.on("PlayerLeft", handlePlayerLeft);
    connection.on("RebuyUpdated", handleRebuyUpdated);
    connection.on("ScoreAdded", handleScoreAdded);

    return () => {
      connection.off("KnockoutTargetsUpdated", handleKnockoutTargetsUpdated);
      connection.off("GameUpdated", handleGameUpdated);
      connection.off("RoundStarted", handleRoundStarted);
      connection.off("GameFinished", handleGameFinished);
      connection.off("KnockoutUpdated", handleKnockoutUpdated);
      connection.off("PlayerRemoved", handlePlayerRemoved);
      connection.off("RulesUpdated", handleRulesUpdated);
      connection.off("PlayerJoined", handlePlayerJoined);
      connection.off("PlayerLeft", handlePlayerLeft);
      connection.off("RebuyUpdated", handleRebuyUpdated);
      connection.off("ScoreAdded", handleScoreAdded);
    };
  }, []);

  useEffect(() => {
    const connection = getGameHubConnection();
    let cancelled = false;

    const prevIds = subscribedIdsRef.current;
    const nextIds = new Set(effectiveGameIds);

    const idsToJoin = [...nextIds].filter((id) => !prevIds.has(id));
    const idsToLeave = [...prevIds].filter((id) => !nextIds.has(id));

    const syncGroups = async () => {
      await startGameHub();
      if (cancelled) return;

      if (connection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      for (const id of idsToJoin) {
        const currentRefCount = joinedGameRefs.get(id) ?? 0;

        if (currentRefCount === 0) {
          try {
            await connection.invoke("JoinGameGroup", id);
            joinedGameRefs.set(id, 1);
            console.log(`▶️ Joined GameGroup ${id}`);
          } catch (err) {
            console.error(`❌ Failed to join GameGroup ${id}`, err);
          }
        } else {
          joinedGameRefs.set(id, currentRefCount + 1);
          console.log(`ℹ️ GameGroup ${id} already joined, refCount=${currentRefCount + 1}`);
        }
      }

      for (const id of idsToLeave) {
        const currentRefCount = joinedGameRefs.get(id);
        if (currentRefCount === undefined) continue;

        if (currentRefCount <= 1) {
          if (connection.state === signalR.HubConnectionState.Connected) {
            try {
              await connection.invoke("LeaveGameGroup", id);
              joinedGameRefs.delete(id);
              console.log(`👋 Left GameGroup ${id}`);
            } catch (err) {
              console.error(`❌ Failed to leave GameGroup ${id}`, err);
            }
          } else {
            joinedGameRefs.delete(id);
          }
        } else {
          joinedGameRefs.set(id, currentRefCount - 1);
          console.log(`ℹ️ Decremented GameGroup ${id} refCount to ${currentRefCount - 1}`);
        }
      }

      subscribedIdsRef.current = nextIds;
    };

    syncGroups().catch((err) => {
      console.error("❌ Failed to sync GameHub groups", err);
    });

    return () => {
      cancelled = true;
    };
  }, [gameIdsKey]);

  useEffect(() => {
    return () => {
      const connection = getGameHubConnection();
      const subscribedIds = subscribedIdsRef.current;

      for (const id of subscribedIds) {
        const currentRefCount = joinedGameRefs.get(id);
        if (currentRefCount === undefined) continue;

        if (currentRefCount <= 1) {
          if (connection.state === signalR.HubConnectionState.Connected) {
            connection
              .invoke("LeaveGameGroup", id)
              .then(() => {
                joinedGameRefs.delete(id);
                console.log(`👋 Left GameGroup ${id}`);
              })
              .catch((err) => {
                console.error(`❌ Failed to leave GameGroup ${id}`, err);
              });
          } else {
            joinedGameRefs.delete(id);
          }
        } else {
          joinedGameRefs.set(id, currentRefCount - 1);
          console.log(`ℹ️ Decremented GameGroup ${id} refCount to ${currentRefCount - 1}`);
        }
      }

      subscribedIdsRef.current = new Set();
    };
  }, []);
}