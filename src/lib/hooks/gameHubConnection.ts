// // gameHubClient.ts
// import * as signalR from '@microsoft/signalr';

// export const gameHubConnection = new signalR.HubConnectionBuilder()
//   .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL!}`, {
//     skipNegotiation: true,
//     transport: signalR.HttpTransportType.WebSockets,
//     withCredentials: true,
//   })
//   .withAutomaticReconnect()
//   .configureLogging(signalR.LogLevel.Information)
//   .build();