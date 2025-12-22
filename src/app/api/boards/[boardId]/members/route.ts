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
      select: { ownerId: true },
    });
    if (!board) return NextResponse.json(null, { status: 404 });
    return NextResponse.json([{ userId: board.ownerId, role: "owner" }]);
  } catch {
    return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
  }
}
