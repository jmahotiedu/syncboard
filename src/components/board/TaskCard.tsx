"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@prisma/client";

type Props = {
  task: Task;
};

export function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task:${task.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded bg-zinc-700/60 px-3 py-2 text-sm text-zinc-100 border border-zinc-600/60 cursor-grab active:cursor-grabbing"
    >
      {task.title}
    </li>
  );
}
