import { io, type Socket } from "socket.io-client";

declare global {
  var __syncboardSocketClient: Socket | undefined;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4001";

export const getSocketClient = (): Socket => {
  if (!globalThis.__syncboardSocketClient) {
    globalThis.__syncboardSocketClient = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5_000,
    });
  }

  return globalThis.__syncboardSocketClient;
};
