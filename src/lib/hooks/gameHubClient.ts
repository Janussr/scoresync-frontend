import * as signalR from "@microsoft/signalr";

let connectionStartCount = 0;

// key = gameId, value = antal aktive subscribers/hooks
export const joinedGameRefs = new Map<number, number>();

export const getHubBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_HUB_URL_LAN!;
  }

  const host = window.location.hostname;

  if (host.includes("localhost")) return process.env.NEXT_PUBLIC_HUB_URL_LOCAL!;
  if (host.includes("rpi.local")) return process.env.NEXT_PUBLIC_HUB_URL_LAN!;
  if (host.startsWith("100.")) return process.env.NEXT_PUBLIC_HUB_URL_TAILSCALE!;

  return process.env.NEXT_PUBLIC_HUB_URL_LAN!;
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
    console.log("Connection state after reconnect:", connection.state);

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
    console.log("ℹ️ GameHub already connected, state: Connected");
    return;
  }

  if (connection.state === signalR.HubConnectionState.Connecting) {
    console.log("ℹ️ GameHub is currently connecting...");
    return;
  }

  if (connection.state === signalR.HubConnectionState.Reconnecting) {
    console.log("ℹ️ GameHub is currently reconnecting...");
    return;
  }

  connectionStartCount++;
  console.log(`✅ GameHub connecting... (count=${connectionStartCount})`);

  await connection.start();

  console.log("✅ GameHub connected (singleton)");
}