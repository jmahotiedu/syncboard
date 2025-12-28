"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBoardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const board = await res.json();
      router.push(`/boards/${board.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">New board</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Board name"
          className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-600 px-4 py-2 font-medium hover:bg-zinc-500 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create"}
        </button>
      </form>
    </main>
  );
}
