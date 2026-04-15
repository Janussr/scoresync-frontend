import * as signalR from "@microsoft/signalr";

let connectionStartCount = 0;
let startPromise: Promise<void> | null = null;

// key = gameId, value = antal aktive subscribers/hooks
export const joinedGameRefs = new Map<number, number>();

export const getHubBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_HUB_URL_PROD!;
  }

  const host = window.location.hostname;

  if (host.includes("localhost")) return process.env.NEXT_PUBLIC_HUB_URL_LOCAL!;
  if (host.includes("rpi.local")) return process.env.NEXT_PUBLIC_HUB_URL_LAN!;
  if (host.startsWith("100.")) return process.env.NEXT_PUBLIC_HUB_URL_TAILSCALE!;

  return process.env.NEXT_PUBLIC_HUB_URL_PROD!;
};

let gameHubConnection: signalR.HubConnection | null = null;

export const getGameHubConnection = () => {
  if (gameHubConnection) return gameHubConnection;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(getHubBaseUrl(), {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.onreconnecting((error) => {
    console.warn("⚠️ GameHub reconnecting...", error);
  });

  connection.onreconnected(async () => {
    console.log("🔄 Reconnected to GameHub");

    for (const [gameId] of joinedGameRefs) {
      try {
        await connection.invoke("JoinGameGroup", gameId);
        console.log(`▶️ Re-joined GameGroup ${gameId} after reconnect`);
      } catch (err) {
        console.error(`❌ Failed to re-join GameGroup ${gameId}`, err);
      }
    }
  });

  connection.onclose((error) => {
    console.warn("🔌 GameHub closed", error);
  });

  gameHubConnection = connection;
  return gameHubConnection;
};

export async function startGameHub() {
  const connection = getGameHubConnection();

  if (connection.state === signalR.HubConnectionState.Connected) {
    return;
  }

  if (connection.state === signalR.HubConnectionState.Connecting && startPromise) {
    await startPromise;
    return;
  }

  if (connection.state === signalR.HubConnectionState.Reconnecting) {
    return;
  }

  connectionStartCount++;
  console.log(`✅ GameHub connecting... (count=${connectionStartCount})`);

  startPromise = connection.start();

  try {
    await startPromise;
    console.log("✅ GameHub connected (singleton)");
  } finally {
    startPromise = null;
  }
}