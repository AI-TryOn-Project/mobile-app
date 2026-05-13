/* ───────────────────────────────────────────
   Try-On Service — mirrors /api/task/tryon routes
   ─────────────────────────────────────────── */

import { mockDelay } from "@/api/client";
import type { TryOnTaskRequest, TaskStatusResponse, TaskStatus } from "@/api/types";

const TRY_ON_RESULT_IMAGE = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80";

const tasks = new Map<string, TaskStatusResponse>();

export async function createTryOnTask(_req: TryOnTaskRequest): Promise<{ taskId: string }> {
  await mockDelay(800);
  const taskId = `task_${Date.now()}`;
  tasks.set(taskId, {
    id: taskId,
    status: "PENDING",
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  // Simulate progression
  simulateTaskProgress(taskId);
  return { taskId };
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  await mockDelay(300);
  const task = tasks.get(taskId);
  if (!task) throw new Error("Task not found");
  return { ...task };
}

function simulateTaskProgress(taskId: string) {
  const steps: { status: TaskStatus; progress: number; delay: number; loadingText: string }[] = [
    { status: "PENDING", progress: 0, delay: 500, loadingText: "Uploading images..." },
    { status: "PROCESSING", progress: 25, delay: 1000, loadingText: "Analyzing garments..." },
    { status: "PROCESSING", progress: 50, delay: 1500, loadingText: "Generating outfit..." },
    { status: "PROCESSING", progress: 75, delay: 1200, loadingText: "Finalizing render..." },
    { status: "COMPLETED", progress: 100, delay: 500, loadingText: "Done!" },
  ];

  let i = 0;
  const advance = () => {
    if (i >= steps.length) return;
    const step = steps[i++];
    tasks.set(taskId, {
      id: taskId,
      status: step.status,
      progress: step.progress,
      resultUrl: step.status === "COMPLETED" ? TRY_ON_RESULT_IMAGE : undefined,
      updatedAt: new Date().toISOString(),
      createdAt: tasks.get(taskId)!.createdAt,
    });
    if (i < steps.length) {
      setTimeout(advance, step.delay);
    }
  };
  setTimeout(advance, steps[0].delay);
}

export async function cancelTask(taskId: string): Promise<void> {
  await mockDelay(200);
  const task = tasks.get(taskId);
  if (task) {
    tasks.set(taskId, { ...task, status: "CANCELLED" });
  }
}
