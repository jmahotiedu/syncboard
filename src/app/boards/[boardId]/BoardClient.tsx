"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Board, Column, Task } from "@prisma/client";

import { Board as BoardView } from "@/components/board/Board";
import { ConnectionStatus } from "@/components/presence/ConnectionStatus";
import { PresenceBar } from "@/components/presence/PresenceBar";
import type { BoardData } from "@/lib/board-state";
import { useOptimisticBoard } from "@/lib/hooks/use-optimistic-board";
import { usePresence } from "@/lib/hooks/use-presence";
import { useSocket } from "@/lib/hooks/use-socket";

type BoardWithCols = Board & {
  columns: (Column & { tasks: Task[] })[];
};

export function BoardClient({ initialBoard }: { initialBoard: BoardWithCols }) {
  const { board, setBoard, addTask, moveTask, updateTask, removeTask } = useOptimisticBoard(
    initialBoard as BoardData
  );
  const [newTitle, setNewTitle] = useState("");
  const [newColId, setNewColId] = useState(board.columns[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const { socket, state } = useSocket(board.id);
  const users = usePresence(board.id, socket);

  useEffect(() => {
    fetch("/api/socket").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!newColId || !board.columns.some((column) => column.id === newColId)) {
      setNewColId(board.columns[0]?.id ?? "");
    }
  }, [board.columns, newColId]);

  useEffect(() => {
    const onCreated = (payload: { boardId: string; task: Task }) => {
      if (payload.boardId !== board.id) return;
      addTask(payload.task.columnId, payload.task);
    };

    const onMoved = (payload: { boardId: string; task: Task }) => {
      if (payload.boardId !== board.id) return;
      updateTask(payload.task);
    };

    const onUpdated = (payload: { boardId: string; task: Task }) => {
      if (payload.boardId !== board.id) return;
      updateTask(payload.task);
    };

    const onDeleted = (payload: { boardId: string; taskId: string }) => {
      if (payload.boardId !== board.id) return;
      removeTask(payload.taskId);
    };

    socket.on("task-created", onCreated);
    socket.on("task-moved", onMoved);
    socket.on("task-updated", onUpdated);
    socket.on("task-deleted", onDeleted);

    return () => {
      socket.off("task-created", onCreated);
      socket.off("task-moved", onMoved);
      socket.off("task-updated", onUpdated);
      socket.off("task-deleted", onDeleted);
    };
  }, [addTask, board.id, removeTask, socket, updateTask]);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newColId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/boards/${board.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: newColId, title: newTitle.trim() }),
      });
      if (!res.ok) return;

      const task = (await res.json()) as Task;
      addTask(task.columnId, task);
      socket.emit("task-created", { boardId: board.id, task });
      setNewTitle("");
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveTask(taskId: string, targetColumnId: string, targetOrder: number) {
    const previous = board;
    moveTask(taskId, targetColumnId, targetOrder);

    const movingTask = previous.columns
      .flatMap((column) => column.tasks)
      .find((task) => task.id === taskId);
    if (!movingTask) return;

    try {
      const res = await fetch(`/api/boards/${board.id}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: targetColumnId,
          order: targetOrder,
        }),
      });

      if (!res.ok) {
        setBoard(previous);
        return;
      }

      const updated = (await res.json()) as Task;
      updateTask(updated);
      socket.emit("task-moved", { boardId: board.id, task: updated });
    } catch {
      setBoard(previous);
      updateTask(movingTask);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <Link href="/" className="text-zinc-400 hover:text-zinc-200 text-sm">
            &larr; Home
          </Link>
          <h1 className="text-2xl font-semibold mt-1">{board.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <PresenceBar users={users} />
          <ConnectionStatus state={state} />
        </div>
      </div>

      {board.columns.length > 0 && (
        <form onSubmit={handleAddTask} className="flex flex-wrap items-center gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task"
            className="rounded bg-zinc-800 border border-zinc-600 px-3 py-1.5 text-sm w-56"
          />
          <select
            value={newColId}
            onChange={(e) => setNewColId(e.target.value)}
            className="rounded bg-zinc-800 border border-zinc-600 px-3 py-1.5 text-sm"
          >
            {board.columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-zinc-600 px-3 py-1.5 text-sm hover:bg-zinc-500 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      <BoardView columns={board.columns} onMoveTask={handleMoveTask} />
    </div>
  );
}

