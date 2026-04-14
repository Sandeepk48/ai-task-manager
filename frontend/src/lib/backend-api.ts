import { apiJson } from "./api";

export type AuthResponse = {
  access_token: string;
  user: { id: string; email: string };
};

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskDto = {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  aiSummary: string | null;
  aiSuggestedPriority: TaskPriority | null;
  createdAt: string;
};

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signupApi(email: string, password: string): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchTasksApi(token: string): Promise<TaskDto[]> {
  return apiJson<TaskDto[]>("/tasks", { token });
}

export type CreateTaskBody = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
};

export async function createTaskApi(
  token: string,
  body: CreateTaskBody,
): Promise<TaskDto> {
  return apiJson<TaskDto>("/tasks", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export type UpdateTaskBody = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  /** ISO date (`yyyy-mm-dd`) or `null` to clear */
  dueDate?: string | null;
};

export async function updateTaskApi(
  token: string,
  taskId: string,
  body: UpdateTaskBody,
): Promise<TaskDto> {
  return apiJson<TaskDto>(`/tasks/${taskId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteTaskApi(token: string, taskId: string): Promise<void> {
  await apiJson<{ ok: boolean }>(`/tasks/${taskId}`, {
    method: "DELETE",
    token,
  });
}
