import assert from "node:assert/strict";
import test from "node:test";

import type { BoardData } from "../src/lib/board-state";
import { addTaskToBoard, moveTaskOptimistic, removeTaskFromBoard } from "../src/lib/board-state";

const baseBoard = (): BoardData => ({
  id: "board-1",
  name: "Demo",
  ownerId: "owner-1",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  columns: [
    {
      id: "col-1",
      title: "To Do",
      order: 0,
      boardId: "board-1",
      tasks: [
        {
          id: "task-1",
          title: "First",
          description: null,
          priority: null,
          order: 0,
          columnId: "col-1",
          createdAt: new Date("2026-01-01T00:00:00Z"),
          updatedAt: new Date("2026-01-01T00:00:00Z"),
        },
      ],
    },
    {
      id: "col-2",
      title: "Doing",
      order: 1,
      boardId: "board-1",
      tasks: [],
    },
  ],
});

test("moveTaskOptimistic moves tasks between columns", () => {
  const moved = moveTaskOptimistic(baseBoard(), "task-1", "col-2", 0);
  assert.equal(moved.columns[0].tasks.length, 0);
  assert.equal(moved.columns[1].tasks.length, 1);
  assert.equal(moved.columns[1].tasks[0]?.id, "task-1");
  assert.equal(moved.columns[1].tasks[0]?.columnId, "col-2");
});

test("addTaskToBoard appends with normalized order", () => {
  const next = addTaskToBoard(baseBoard(), "col-1", {
    id: "task-2",
    title: "Second",
    description: null,
    priority: null,
    order: 99,
    columnId: "col-1",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  });

  assert.equal(next.columns[0].tasks.length, 2);
  assert.deepEqual(
    next.columns[0].tasks.map((task) => task.order),
    [0, 1]
  );
});

test("removeTaskFromBoard removes task and reorders remaining", () => {
  const withTwo = addTaskToBoard(baseBoard(), "col-1", {
    id: "task-2",
    title: "Second",
    description: null,
    priority: null,
    order: 1,
    columnId: "col-1",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  });

  const removed = removeTaskFromBoard(withTwo, "task-1");
  assert.equal(removed.columns[0].tasks.length, 1);
  assert.equal(removed.columns[0].tasks[0]?.id, "task-2");
  assert.equal(removed.columns[0].tasks[0]?.order, 0);
});
