"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import type { BoardColumn } from "@/lib/board-state";
import { TaskCard } from "./TaskCard";

type Props = {
  column: BoardColumn;
};

export function Column({ column }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${column.id}` });
  const itemIds = column.tasks.map((task) => `task:${task.id}`);

  return (
    <section
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 rounded-lg bg-zinc-800/80 p-3 border ${
        isOver ? "border-emerald-400/80" : "border-zinc-700"
      }`}
    >
      <h2 className="font-medium text-zinc-200 mb-2">{column.title}</h2>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2 min-h-12">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      </SortableContext>
    </section>
  );
}
