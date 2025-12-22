import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: { orderBy: { order: "asc" }, include: { tasks: { orderBy: { order: "asc" } } } },
      },
    });
    if (!board) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(board);
  } catch {
    return NextResponse.json({ error: "Failed to load board" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  try {
    await prisma.board.delete({ where: { id: boardId } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete board" }, { status: 500 });
  }
}
