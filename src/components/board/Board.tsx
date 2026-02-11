"use client";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { BoardColumn } from "@/lib/board-state";
import { Column } from "./Column";

type Props = {
  columns: BoardColumn[];
  onMoveTask: (taskId: string, targetColumnId: string, targetOrder: number) => void | Promise<void>;
};

const parseTaskId = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  if (!value.startsWith("task:")) return null;
  return value.slice("task:".length);
};

const parseColumnId = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  if (!value.startsWith("col:")) return null;
  return value.slice("col:".length);
};

const findColumnByTaskId = (columns: BoardColumn[], taskId: string): BoardColumn | undefined =>
  columns.find((column) => column.tasks.some((task) => task.id === taskId));

export function Board({ columns, onMoveTask }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const activeTaskId = parseTaskId(event.active.id);
    if (!activeTaskId) return;

    const overId = event.over?.id;
    if (!overId) return;

    const sourceColumn = findColumnByTaskId(columns, activeTaskId);
    if (!sourceColumn) return;

    const targetTaskId = parseTaskId(overId);
    const targetColumnId = parseColumnId(overId);

    if (targetTaskId) {
      const destinationColumn = findColumnByTaskId(columns, targetTaskId);
      if (!destinationColumn) return;

      const targetOrder = destinationColumn.tasks.findIndex((task) => task.id === targetTaskId);
      if (targetOrder < 0) return;

      const sourceOrder = sourceColumn.tasks.findIndex((task) => task.id === activeTaskId);
      if (destinationColumn.id === sourceColumn.id && sourceOrder === targetOrder) return;

      void onMoveTask(activeTaskId, destinationColumn.id, targetOrder);
      return;
    }

    if (targetColumnId) {
      const destinationColumn = columns.find((column) => column.id === targetColumnId);
      if (!destinationColumn) return;
      const targetOrder = destinationColumn.tasks.length;
      void onMoveTask(activeTaskId, destinationColumn.id, targetOrder);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.length === 0 ? (
          <p className="text-zinc-400">No columns yet.</p>
        ) : (
          columns.map((column) => <Column key={column.id} column={column} />)
        )}
      </div>
    </DndContext>
  );
}
