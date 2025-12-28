"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Board, Column, Task } from "@prisma/client";

type BoardWithCols = Board & {
  columns: (Column & { tasks: Task[] })[];
};

export function BoardClient({ initialBoard }: { initialBoard: BoardWithCols }) {
  const router = useRouter();
  const [board, setBoard] = useState(initialBoard);
  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);
  const [newTitle, setNewTitle] = useState("");
  const [newColId, setNewColId] = useState(board.columns[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newColId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/boards/${board.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: newColId, title: newTitle.trim() }),
      });
      if (res.ok) {
        setNewTitle("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 text-sm">
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold">{board.name}</h1>
      </div>
      {board.columns.length > 0 && (
        <form onSubmit={addTask} className="flex flex-wrap items-center gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task"
            className="rounded bg-zinc-800 border border-zinc-600 px-3 py-1.5 text-sm w-48"
          />
          <select
            value={newColId}
            onChange={(e) => setNewColId(e.target.value)}
            className="rounded bg-zinc-800 border border-zinc-600 px-3 py-1.5 text-sm"
          >
            {board.columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-zinc-600 px-3 py-1.5 text-sm hover:bg-zinc-500 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.length === 0 ? (
          <p className="text-zinc-400">No columns yet.</p>
        ) : (
          board.columns.map((col) => (
            <div
              key={col.id}
              className="flex-shrink-0 w-72 rounded-lg bg-zinc-800/80 p-3 border border-zinc-700"
            >
              <h2 className="font-medium text-zinc-200 mb-2">{col.title}</h2>
              <ul className="space-y-2">
                {col.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded bg-zinc-700/60 px-3 py-2 text-sm text-zinc-100"
                  >
                    {task.title}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
