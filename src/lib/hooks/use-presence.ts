"use client";

import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";

type PresenceUser = {
  id: string;
  name: string;
  updatedAt: number;
};

const PRESENCE_INTERVAL_MS = 30_000;
const PRESENCE_TIMEOUT_MS = 60_000;

const makeUserName = (): string => `Guest-${Math.floor(Math.random() * 9000 + 1000)}`;

export function usePresence(boardId: string, socket: Socket): PresenceUser[] {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const user = useMemo(
    () => ({ id: `anon-${Math.random().toString(36).slice(2, 10)}`, name: makeUserName() }),
    []
  );

  useEffect(() => {
    const emitPresence = () => {
      socket.emit("presence-update", {
        boardId,
        user: { id: user.id, name: user.name },
        updatedAt: Date.now(),
      });
    };

    const onSnapshot = (payload: { boardId: string; users: PresenceUser[] }) => {
      if (payload.boardId !== boardId) return;
      setUsers(payload.users);
    };

    const onPresence = (payload: { boardId: string; user: PresenceUser }) => {
      if (payload.boardId !== boardId) return;
      setUsers((current) => {
        const filtered = current.filter((entry) => entry.id !== payload.user.id);
        return [...filtered, payload.user];
      });
    };

    const onLeave = (payload: { boardId: string; userId: string }) => {
      if (payload.boardId !== boardId) return;
      setUsers((current) => current.filter((entry) => entry.id !== payload.userId));
    };

    const pruneStale = () => {
      const now = Date.now();
      setUsers((current) => current.filter((entry) => now - entry.updatedAt <= PRESENCE_TIMEOUT_MS));
    };

    socket.on("presence-snapshot", onSnapshot);
    socket.on("presence-update", onPresence);
    socket.on("presence-leave", onLeave);

    emitPresence();
    const heartbeat = setInterval(emitPresence, PRESENCE_INTERVAL_MS);
    const prune = setInterval(pruneStale, PRESENCE_INTERVAL_MS);

    return () => {
      clearInterval(heartbeat);
      clearInterval(prune);
      socket.off("presence-snapshot", onSnapshot);
      socket.off("presence-update", onPresence);
      socket.off("presence-leave", onLeave);
      socket.emit("presence-leave", { boardId, userId: user.id });
    };
  }, [boardId, socket, user.id, user.name]);

  return users;
}
