import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  columnId: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  const { boardId, taskId } = await params;
  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, column: { boardId } },
      include: { column: true },
    });
    if (!task) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  const { boardId, taskId } = await params;
  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, column: { boardId } },
    });
    if (!existing) return NextResponse.json(null, { status: 404 });
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(parsed.data.title != null && { title: parsed.data.title }),
        ...(parsed.data.columnId != null && { columnId: parsed.data.columnId }),
        ...(parsed.data.order != null && { order: parsed.data.order }),
      },
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  const { taskId } = await params;
  try {
    await prisma.task.delete({ where: { id: taskId } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
