import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({ name: z.string().min(1).max(200) });

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, createdAt: true },
    });
    return NextResponse.json(boards);
  } catch {
    return NextResponse.json({ error: "Failed to list boards" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    const board = await prisma.board.create({
      data: {
        name: parsed.data.name,
        ownerId: "anonymous",
      },
    });
    return NextResponse.json(board);
  } catch {
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
