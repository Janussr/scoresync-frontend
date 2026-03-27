// gameHubClient.ts
import * as signalR from "@microsoft/signalr";
import { Game, RoundDto } from "@/lib/models/game";

type Handlers = {
  onGameUpdated?: (game: Game) => void;
  onRoundStarted?: (round: RoundDto) => void;
  onRoundEnded?: (round: RoundDto) => void;
  onGameFinished?: (gameId: number) => void;
};

let handlers: Handlers = {};

export const gameHubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL!}`, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
    withCredentials: true,
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

// 🔥 START KUN ÉN GANG
export async function startGameHub() {
  if (gameHubConnection.state === "Disconnected") {
    await gameHubConnection.start();
    console.log("✅ GameHub connected (singleton)");
  }
}

// 🔥 SET HANDLERS (hook styrer disse)
export function setGameHubHandlers(newHandlers: Handlers) {
  handlers = newHandlers;
}

// 🔥 EVENTS (kun registreret én gang!)
gameHubConnection.on("GameFinished", (id: number) => {
  console.log("🏁 Game finished", id);
  handlers.onGameFinished?.(id);
});

gameHubConnection.on("GameUpdated", (game: Game) => {
  handlers.onGameUpdated?.(game);
});

gameHubConnection.on("RoundStarted", (round: RoundDto) => {
  console.log("▶️ Round started", round);
  handlers.onRoundStarted?.(round);
});

// gameHubConnection.on("RoundEnded", (round: RoundDto) => {
//   console.log("⏹ Round ended", round);
//   handlers.onRoundEnded?.(round);
// });

// 🔥 RECONNECT (kun én gang!)
gameHubConnection.onreconnected(async () => {
  console.log("🔄 Reconnected to GameHub");
  // vi re-joiner via hook (fordi gameId lever der)
});