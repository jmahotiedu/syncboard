import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { BoardClient } from "./BoardClient";

type Props = { params: Promise<{ boardId: string }> };

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params;
  let board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: { orderBy: { order: "asc" }, include: { tasks: { orderBy: { order: "asc" } } } },
    },
  });
  if (!board && boardId === "demo") {
    board = await prisma.board.findFirst({
      where: { name: "Demo" },
      include: {
        columns: { orderBy: { order: "asc" }, include: { tasks: { orderBy: { order: "asc" } } } },
      },
    });
    if (!board) {
      board = await prisma.board.create({
        data: {
          name: "Demo",
          ownerId: "anonymous",
          columns: {
            create: [
              { title: "To Do", order: 0 },
              { title: "In Progress", order: 1 },
              { title: "Done", order: 2 },
            ],
          },
        },
        include: {
          columns: { orderBy: { order: "asc" }, include: { tasks: { orderBy: { order: "asc" } } } },
        },
      });
    }
  }
  if (!board) notFound();
  return (
    <main className="min-h-screen p-6">
      <BoardClient initialBoard={board} />
    </main>
  );
}
