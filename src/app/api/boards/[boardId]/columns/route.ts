import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({ title: z.string().min(1).max(100) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    const count = await prisma.column.count({ where: { boardId } });
    const col = await prisma.column.create({
      data: {
        boardId,
        title: parsed.data.title,
        order: count,
      },
    });
    return NextResponse.json(col);
  } catch {
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
  }
}
