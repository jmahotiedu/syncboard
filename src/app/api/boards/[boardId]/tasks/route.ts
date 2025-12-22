import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  columnId: z.string(),
  title: z.string().min(1).max(500),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const column = await prisma.column.findFirst({
      where: { id: parsed.data.columnId, boardId },
    });
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }
    const count = await prisma.task.count({ where: { columnId: column.id } });
    const task = await prisma.task.create({
      data: {
        columnId: column.id,
        title: parsed.data.title,
        order: count,
      },
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
