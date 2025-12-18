import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let boards: { id: string; name: string }[] = [];
  try {
    boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true },
    });
  } catch {
    boards = [];
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Syncboard</h1>
        <p className="mt-2 text-zinc-400">
          Real-time collaborative kanban board. Open the demo or create a board.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/boards/demo"
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-600"
          >
            Open demo board
          </Link>
          <Link
            href="/boards/new"
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium hover:bg-zinc-800"
          >
            New board
          </Link>
        </div>
        {boards.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">Recent boards</h2>
            <ul className="space-y-2">
              {boards.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/boards/${b.id}`}
                    className="text-zinc-300 hover:text-white underline"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
