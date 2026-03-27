import * as signalR from "@microsoft/signalr";

let connectionStartCount = 0;

// Holder styr på hvilke game groups der er joined globalt
// key = gameId, value = antal aktive subscribers/hooks
export const joinedGameRefs = new Map<number, number>();

export const gameHubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL!}`, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
    withCredentials: true,
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export async function startGameHub() {
  if (gameHubConnection.state === signalR.HubConnectionState.Connected) {
    console.log("ℹ️ GameHub already connected, state: Connected");
    return;
  }

  if (gameHubConnection.state === signalR.HubConnectionState.Connecting) {
    console.log("ℹ️ GameHub is currently connecting...");
    return;
  }

  if (gameHubConnection.state === signalR.HubConnectionState.Reconnecting) {
    console.log("ℹ️ GameHub is currently reconnecting...");
    return;
  }

  connectionStartCount++;
  console.log(`✅ GameHub connecting... (count=${connectionStartCount})`);

  await gameHubConnection.start();

  console.log("✅ GameHub connected (singleton)");
}

gameHubConnection.onreconnecting((error) => {
  console.warn("⚠️ GameHub reconnecting...", error);
});

gameHubConnection.onreconnected(async () => {
  console.log("🔄 Reconnected to GameHub");
  console.log("Connection state after reconnect:", gameHubConnection.state);

  for (const [gameId] of joinedGameRefs) {
    try {
      await gameHubConnection.invoke("JoinGameGroup", gameId);
      console.log(`▶️ Re-joined GameGroup ${gameId} after reconnect`);
    } catch (err) {
      console.error(`❌ Failed to re-join GameGroup ${gameId}`, err);
    }
  }
});

gameHubConnection.onclose((error) => {
  console.warn("🔌 GameHub closed", error);
});