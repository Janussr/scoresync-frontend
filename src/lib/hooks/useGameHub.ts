"use client";

import { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { Game, RoundDto } from "@/lib/models/game";

type UseGameHubProps = {
  gameId?: number;
  onGameUpdated?: (game: Game) => void;
  onRoundStarted?: (round: RoundDto) => void;
  onRoundEnded?: () => void;
  onGameFinished?: (gameId: number) => void;
};

export function useGameHub({
  gameId,
  onGameUpdated,
  onRoundStarted,
  onRoundEnded,
  onGameFinished,
}: UseGameHubProps) {
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
  if (!gameId) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL!}`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    async function startConnection() {
      try {
        await connection.start();
        if (!isMounted) return;
        console.log("✅ Connected to GameHub");
        await connection.invoke("JoinGameGroup", gameId);
      } catch (err) {
        console.error("❌ SignalR start error:", err);
      }
    }

    // EVENTS
    connection.on("GameFinished", (finishedGameId: number) => {
      if (!isMounted) return;
      console.log("🏁 Game finished", finishedGameId);
      onGameFinished?.(finishedGameId);
    });

    if (onGameUpdated) {
      connection.on("GameUpdated", (game: Game) => {
        if (!isMounted) return;
        onGameUpdated(game);
      });
    }

    if (onRoundStarted) {
      connection.on("RoundStarted", (round: RoundDto) => {
        if (!isMounted) return;
        onRoundStarted(round);
      });
    }

    connection.on("RoundEnded", () => {
      if (!isMounted) return;
      console.log("⏹ Round ended");
      onRoundEnded?.();
    });

    startConnection();

    return () => {
      isMounted = false;
      if (connection.state === "Connected") {
        connection.invoke("LeaveGameGroup", gameId).catch(() => {});
      }
      connection.stop().catch(() => {});
    };
  }, [gameId]);

  return { connection: connectionRef.current };
}