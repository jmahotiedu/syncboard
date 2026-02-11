"use client";

import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";

import { getSocketClient } from "@/lib/socket-client";

export type ConnectionState = "connected" | "reconnecting" | "disconnected";

export function useSocket(boardId: string): { socket: Socket; state: ConnectionState } {
  const socket = useMemo(() => getSocketClient(), []);
  const [state, setState] = useState<ConnectionState>(
    socket.connected ? "connected" : "disconnected"
  );

  useEffect(() => {
    const onConnect = () => {
      setState("connected");
      socket.emit("join-board", { boardId });
    };
    const onDisconnect = () => setState("disconnected");
    const onReconnectAttempt = () => setState("reconnecting");
    const onReconnect = () => {
      setState("connected");
      socket.emit("join-board", { boardId });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.io.on("reconnect", onReconnect);

    if (!socket.connected) socket.connect();
    socket.emit("join-board", { boardId });

    return () => {
      socket.emit("leave-board", { boardId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.io.off("reconnect", onReconnect);
    };
  }, [boardId, socket]);

  return { socket, state };
}
