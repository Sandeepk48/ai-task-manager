"use client";

import { FormEvent, useState } from "react";
import type { TaskDto, TaskPriority, UpdateTaskBody } from "@/lib/backend-api";

export type TaskItem = TaskDto;

type TaskListProps = {
  tasks: TaskItem[];
  loading: boolean;
  savingTaskId: string | null;
  deletingTaskId: string | null;
  onUpdate: (id: string, body: UpdateTaskBody) => Promise<void>;
  onDelete: (id: string) => void;
};

export function TaskList({
  tasks,
  loading,
  savingTaskId,
  deletingTaskId,
  onUpdate,
  onDelete,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/60 py-24 dark:border-zinc-800 dark:bg-zinc-950/40">
        <span
          className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600 dark:border-zinc-700 dark:border-t-emerald-400"
          aria-hidden
        />
        <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Loading tasks…</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 px-6 py-20 text-center dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900/50">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          <ClipboardIcon className="h-7 w-7" />
        </div>
        <p className="mt-5 text-base font-semibold text-zinc-900 dark:text-zinc-50">No tasks yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-500">
          Use the form to add your first task. A clear description helps the AI write a useful summary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card grid — phones & tablets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {tasks.map((task) => (
          <div key={task.id}>
            {editingId === task.id ? (
              <TaskEditCard
                task={task}
                saving={savingTaskId === task.id}
                onCancel={() => setEditingId(null)}
                onSave={async (body) => {
                  try {
                    await onUpdate(task.id, body);
                    setEditingId(null);
                  } catch {
                    /* parent surfaces error */
                  }
                }}
              />
            ) : (
              <TaskCard
                task={task}
                deleting={deletingTaskId === task.id}
                onEdit={() => setEditingId(task.id)}
                onDelete={() => onDelete(task.id)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Table — large screens */}
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <th className="px-4 py-3.5 font-semibold text-zinc-700 dark:text-zinc-300">Title</th>
                  <th className="px-4 py-3.5 font-semibold text-zinc-700 dark:text-zinc-300">AI summary</th>
                  <th className="w-28 px-4 py-3.5 font-semibold text-zinc-700 dark:text-zinc-300">Priority</th>
                  <th className="w-36 px-4 py-3.5 font-semibold text-zinc-700 dark:text-zinc-300">Due date</th>
                  <th className="w-32 px-4 py-3.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {tasks.map((task) =>
                  editingId === task.id ? (
                    <tr key={task.id} className="bg-emerald-50/30 dark:bg-emerald-950/15">
                      <td colSpan={5} className="p-4">
                        <TaskEditCard
                          task={task}
                          saving={savingTaskId === task.id}
                          onCancel={() => setEditingId(null)}
                          onSave={async (body) => {
                            try {
                              await onUpdate(task.id, body);
                              setEditingId(null);
                            } catch {
                              /* parent surfaces error */
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={task.id}
                      className={`transition hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 ${
                        deletingTaskId === task.id ? "opacity-50" : ""
                      }`}
                    >
                      <td className="max-w-[200px] px-4 py-4 align-top">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{task.title}</p>
                      </td>
                      <td className="max-w-md px-4 py-4 align-top">
                        <AiSummaryBlock summary={task.aiSummary} compact />
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <PriorityBadge value={task.priority} />
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <DueDatePill date={task.dueDate} />
                      </td>
                      <td className="px-4 py-4 align-middle text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(task.id)}
                            disabled={deletingTaskId === task.id}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-40 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(task.id)}
                            disabled={deletingTaskId === task.id}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            {deletingTaskId === task.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  deleting,
  onEdit,
  onDelete,
}: {
  task: TaskItem;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-900/5 transition hover:border-emerald-200/80 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/5 dark:hover:border-emerald-900/40 ${
        deleting ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          {task.title}
        </h3>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge value={task.priority} />
        <DueDatePill date={task.dueDate} />
      </div>
      <div className="mt-4 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/90 dark:text-emerald-400/90">
          AI summary
        </p>
        <AiSummaryBlock summary={task.aiSummary} />
      </div>
      <div className="mt-5 flex gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={onEdit}
          disabled={deleting}
          className="flex-1 rounded-xl bg-emerald-600/10 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-600/15 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex-1 rounded-xl border border-red-200/80 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}

function AiSummaryBlock({ summary, compact }: { summary: string | null; compact?: boolean }) {
  if (!summary) {
    return (
      <p
        className={`mt-1 text-zinc-400 italic dark:text-zinc-500 ${compact ? "text-xs leading-relaxed" : "text-sm"}`}
      >
        No AI summary yet.
      </p>
    );
  }
  return (
    <p
      className={`mt-1 text-zinc-600 dark:text-zinc-300 ${compact ? "line-clamp-3 text-xs leading-relaxed" : "text-sm leading-relaxed"}`}
    >
      {summary}
    </p>
  );
}

function DueDatePill({ date }: { date: string | null }) {
  if (!date) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
        No due date
      </span>
    );
  }
  const formatted = new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900 ring-1 ring-sky-200/80 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-800/60">
      <CalendarIcon className="h-3.5 w-3.5 opacity-80" />
      {formatted}
    </span>
  );
}

function TaskEditCard({
  task,
  saving,
  onCancel,
  onSave,
}: {
  task: TaskItem;
  saving: boolean;
  onCancel: () => void;
  onSave: (body: UpdateTaskBody) => Promise<void>;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : "",
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body: UpdateTaskBody = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate.trim() ? dueDate : null,
    };
    await onSave(body);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-sm dark:border-emerald-900/40 dark:from-zinc-950 dark:to-emerald-950/20"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
        Edit task
      </p>
      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Title</label>
          <input
            required
            minLength={1}
            disabled={saving}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
          <textarea
            disabled={saving}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Priority</label>
            <select
              disabled={saving}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Due date</label>
            <input
              type="date"
              disabled={saving}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-w-[100px] items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </form>
  );
}

function PriorityBadge({ value }: { value: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    LOW: "bg-zinc-100 text-zinc-800 ring-zinc-200/90 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600",
    MEDIUM:
      "bg-amber-100 text-amber-950 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/50",
    HIGH: "bg-red-100 text-red-900 ring-red-200/90 dark:bg-red-950/50 dark:text-red-100 dark:ring-red-900/50",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${styles[value]}`}
    >
      {formatPriority(value)}
    </span>
  );
}

function formatPriority(p: TaskPriority) {
  return p.charAt(0) + p.slice(1).toLowerCase();
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
      />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h2m-2 4h2m1-7h.01M12 6h.01"
      />
    </svg>
  );
}
