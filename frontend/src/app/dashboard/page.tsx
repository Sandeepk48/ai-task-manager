"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, formatApiError } from "@/lib/api";
import {
  deleteTaskApi,
  fetchTasksApi,
  updateTaskApi,
  type TaskDto,
  type UpdateTaskBody,
} from "@/lib/backend-api";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NewTaskForm } from "@/components/tasks/new-task-form";
import { TaskList } from "@/components/tasks/task-list";
import { clearSession, getToken, getUser, type SessionUser } from "@/lib/session";

function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

export default function DashboardPage() {
  const router = useRouter();
  const token = useMemo(() => getToken(), []);
  const initialUser = useMemo(() => getUser(), []);

  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    if (!token) return;
    const data = await fetchTasksApi(token);
    setTasks(data);
  }, [token]);

  const redirectIfUnauthorized = useCallback(
    (err: unknown) => {
      if (isUnauthorized(err)) {
        clearSession();
        setUser(null);
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router],
  );

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadState("loading");
      setLoadError(null);
      try {
        await refreshTasks();
        if (!cancelled) {
          setLoadState("success");
        }
      } catch (err) {
        if (cancelled) return;
        if (redirectIfUnauthorized(err)) return;
        setLoadState("error");
        setLoadError(formatApiError(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, token, refreshTasks, redirectIfUnauthorized]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const retryLoad = useCallback(async () => {
    if (!token) return;
    setLoadState("loading");
    setLoadError(null);
    try {
      await refreshTasks();
      setLoadState("success");
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setLoadState("error");
      setLoadError(formatApiError(err));
    }
  }, [token, refreshTasks, redirectIfUnauthorized]);

  async function handleUpdate(id: string, body: UpdateTaskBody) {
    if (!token) return;
    setActionError(null);
    setSavingTaskId(id);
    try {
      await updateTaskApi(token, id, body);
      await refreshTasks();
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setActionError(formatApiError(err));
      throw err;
    } finally {
      setSavingTaskId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setActionError(null);
    setDeletingTaskId(id);
    try {
      await deleteTaskApi(token, id);
      await refreshTasks();
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setActionError(formatApiError(err));
    } finally {
      setDeletingTaskId(null);
    }
  }

  if (!token) {
    return null;
  }

  const tasksLoading = loadState === "loading";
  const showTasks = loadState === "success" || (loadState === "error" && tasks.length > 0);

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <main className="relative flex-1 overflow-auto bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Your tasks
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
                Signed in as{" "}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{user?.email}</span>
              </p>
            </div>
            {showTasks && !tasksLoading ? (
              <div className="rounded-full bg-zinc-900/5 px-4 py-2 text-sm font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </div>
            ) : null}
          </header>

          {loadState === "error" && loadError ? (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-2xl border border-amber-200/90 bg-amber-50 px-5 py-4 text-sm text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100"
            >
              <span>{loadError}</span>
              <button
                type="button"
                onClick={retryLoad}
                className="shrink-0 rounded-xl bg-amber-900 px-4 py-2 text-xs font-bold text-amber-50 hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
              >
                Retry
              </button>
            </div>
          ) : null}

          {actionError ? (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-2xl border border-red-200/90 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100"
            >
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-xs font-bold text-red-800 underline hover:no-underline dark:text-red-200"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="grid items-start gap-8 xl:grid-cols-12 xl:gap-10">
            <section className="xl:col-span-5">
              <div className="xl:sticky xl:top-8">
                <NewTaskForm
                  token={token}
                  onCreated={async () => {
                    setLoadState("success");
                    setLoadError(null);
                    setActionError(null);
                    await refreshTasks();
                  }}
                  onError={(message) => setActionError(message)}
                />
              </div>
            </section>

            <section className="min-w-0 xl:col-span-7">
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">All tasks</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 lg:hidden">
                    Card layout · swipe-friendly
                  </p>
                  <p className="hidden text-xs text-zinc-500 dark:text-zinc-500 lg:block">
                    Table layout on large screens · cards on smaller devices
                  </p>
                </div>
              </div>
              <TaskList
                tasks={tasks}
                loading={tasksLoading}
                savingTaskId={savingTaskId}
                deletingTaskId={deletingTaskId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </section>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
