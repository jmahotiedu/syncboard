import { createServer, type Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

type PresenceEntry = {
  id: string;
  name: string;
  updatedAt: number;
};

type PresenceMap = Map<string, Map<string, PresenceEntry>>;

type SyncboardServer = {
  http: HttpServer;
  io: SocketIOServer;
  port: number;
};

declare global {
  var __syncboardSocketServer: SyncboardServer | undefined;
  var __syncboardPresence: PresenceMap | undefined;
}

const getPresenceStore = (): PresenceMap => {
  if (!globalThis.__syncboardPresence) {
    globalThis.__syncboardPresence = new Map();
  }
  return globalThis.__syncboardPresence;
};

const toPresenceList = (boardId: string): PresenceEntry[] => {
  const boardPresence = getPresenceStore().get(boardId);
  if (!boardPresence) return [];
  return [...boardPresence.values()];
};

export const startSocketServer = (): { started: boolean; port: number } => {
  if (globalThis.__syncboardSocketServer) {
    return { started: false, port: globalThis.__syncboardSocketServer.port };
  }

  const port = Number(process.env.SYNCBOARD_SOCKET_PORT ?? 4001);
  const http = createServer();
  const io = new SocketIOServer(http, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.on("join-board", ({ boardId }: { boardId: string }) => {
      socket.join(boardId);
      io.to(boardId).emit("presence-snapshot", { boardId, users: toPresenceList(boardId) });
    });

    socket.on("leave-board", ({ boardId }: { boardId: string }) => {
      socket.leave(boardId);
    });

    socket.on(
      "presence-update",
      ({ boardId, user, updatedAt }: { boardId: string; user: { id: string; name: string }; updatedAt: number }) => {
        const store = getPresenceStore();
        const board = store.get(boardId) ?? new Map<string, PresenceEntry>();
        board.set(user.id, { id: user.id, name: user.name, updatedAt });
        store.set(boardId, board);
        io.to(boardId).emit("presence-update", {
          boardId,
          user: { id: user.id, name: user.name, updatedAt },
        });
      }
    );

    socket.on("presence-leave", ({ boardId, userId }: { boardId: string; userId: string }) => {
      const board = getPresenceStore().get(boardId);
      if (!board) return;
      board.delete(userId);
      io.to(boardId).emit("presence-leave", { boardId, userId });
      io.to(boardId).emit("presence-snapshot", { boardId, users: toPresenceList(boardId) });
    });

    socket.on("task-created", ({ boardId, task }) => {
      socket.to(boardId).emit("task-created", { boardId, task });
    });

    socket.on("task-moved", ({ boardId, task }) => {
      socket.to(boardId).emit("task-moved", { boardId, task });
    });

    socket.on("task-updated", ({ boardId, task }) => {
      socket.to(boardId).emit("task-updated", { boardId, task });
    });

    socket.on("task-deleted", ({ boardId, taskId }) => {
      socket.to(boardId).emit("task-deleted", { boardId, taskId });
    });
  });

  http.listen(port);
  globalThis.__syncboardSocketServer = { http, io, port };
  return { started: true, port };
};
