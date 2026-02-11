"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "@prisma/client";

import {
  addTaskToBoard,
  applyTaskUpdate,
  moveTaskOptimistic,
  removeTaskFromBoard,
  sortBoard,
  type BoardData,
} from "@/lib/board-state";

export function useOptimisticBoard(initialBoard: BoardData) {
  const [board, setBoard] = useState<BoardData>(sortBoard(initialBoard));

  useEffect(() => {
    setBoard(sortBoard(initialBoard));
  }, [initialBoard]);

  const addTask = useCallback((columnId: string, task: Task) => {
    setBoard((current) => addTaskToBoard(current, columnId, task));
  }, []);

  const moveTask = useCallback((taskId: string, targetColumnId: string, targetOrder: number) => {
    setBoard((current) => moveTaskOptimistic(current, taskId, targetColumnId, targetOrder));
  }, []);

  const updateTask = useCallback((task: Task) => {
    setBoard((current) => applyTaskUpdate(current, task));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setBoard((current) => removeTaskFromBoard(current, taskId));
  }, []);

  return { board, setBoard, addTask, moveTask, updateTask, removeTask };
}
