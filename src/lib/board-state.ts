import type { Board, Column, Task } from "@prisma/client";

export type BoardColumn = Column & { tasks: Task[] };
export type BoardData = Board & { columns: BoardColumn[] };

const toMillis = (value: unknown): number => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const cloneBoard = (board: BoardData): BoardData => ({
  ...board,
  columns: board.columns.map((column) => ({
    ...column,
    tasks: column.tasks.map((task) => ({ ...task })),
  })),
});

const normalizeOrder = (tasks: Task[]): Task[] =>
  tasks.map((task, index) => ({
    ...task,
    order: index,
  }));

export const sortBoard = (board: BoardData): BoardData => ({
  ...board,
  columns: [...board.columns]
    .sort((a, b) => a.order - b.order)
    .map((column) => ({
      ...column,
      tasks: [...column.tasks].sort((a, b) => a.order - b.order),
    })),
});

export const addTaskToBoard = (
  board: BoardData,
  columnId: string,
  task: Task
): BoardData => {
  const next = cloneBoard(board);
  next.columns = next.columns.map((column) => {
    if (column.id !== columnId) return column;
    const tasks = normalizeOrder([...column.tasks, task]);
    return { ...column, tasks };
  });
  return sortBoard(next);
};

export const removeTaskFromBoard = (board: BoardData, taskId: string): BoardData => {
  const next = cloneBoard(board);
  next.columns = next.columns.map((column) => {
    const tasks = normalizeOrder(column.tasks.filter((task) => task.id !== taskId));
    return { ...column, tasks };
  });
  return sortBoard(next);
};

export const moveTaskOptimistic = (
  board: BoardData,
  taskId: string,
  targetColumnId: string,
  targetOrder: number
): BoardData => {
  const next = cloneBoard(board);
  let movingTask: Task | null = null;
  let sourceColumnId = "";

  for (const column of next.columns) {
    const found = column.tasks.find((task) => task.id === taskId);
    if (found) {
      movingTask = { ...found };
      sourceColumnId = column.id;
      break;
    }
  }

  if (!movingTask) return board;

  next.columns = next.columns.map((column) => {
    if (column.id === sourceColumnId) {
      return {
        ...column,
        tasks: normalizeOrder(column.tasks.filter((task) => task.id !== taskId)),
      };
    }
    return column;
  });

  next.columns = next.columns.map((column) => {
    if (column.id !== targetColumnId) return column;
    const insertAt = Math.max(0, Math.min(targetOrder, column.tasks.length));
    const tasks = [...column.tasks];
    movingTask!.columnId = targetColumnId;
    tasks.splice(insertAt, 0, movingTask!);
    return {
      ...column,
      tasks: normalizeOrder(tasks),
    };
  });

  return sortBoard(next);
};

export const applyTaskUpdate = (board: BoardData, task: Task): BoardData => {
  const next = cloneBoard(board);
  let foundLocal: Task | null = null;

  for (const column of next.columns) {
    const existing = column.tasks.find((item) => item.id === task.id);
    if (existing) {
      foundLocal = existing;
      break;
    }
  }

  if (foundLocal) {
    const localTs = toMillis(foundLocal.updatedAt);
    const incomingTs = toMillis(task.updatedAt);
    if (incomingTs < localTs) return board;
    const removed = removeTaskFromBoard(next, task.id);
    const withTask = addTaskToBoard(removed, task.columnId, task);
    return moveTaskOptimistic(withTask, task.id, task.columnId, task.order);
  }

  return addTaskToBoard(next, task.columnId, task);
};
