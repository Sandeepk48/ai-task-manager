"use client";

import { FormEvent, useState } from "react";
import type { CreateTaskBody, TaskPriority } from "@/lib/backend-api";
import { createTaskApi } from "@/lib/backend-api";
import { formatApiError } from "@/lib/api";

type NewTaskFormProps = {
  token: string;
  onCreated: () => Promise<void>;
  onError: (message: string | null) => void;
};

export function NewTaskForm({ token, onCreated, onError }: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useAutoPriority, setUseAutoPriority] = useState(true);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    onError(null);
    try {
      const body: CreateTaskBody = {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
      };
      if (!useAutoPriority) {
        body.priority = priority;
      }
      await createTaskApi(token, body);
      setTitle("");
      setDescription("");
      setUseAutoPriority(true);
      setPriority("MEDIUM");
      setDueDate("");
      await onCreated();
    } catch (err) {
      onError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-1 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none dark:ring-white/5">
      <div className="rounded-[calc(1rem-4px)] bg-gradient-to-br from-emerald-50/80 via-white to-white p-5 dark:from-emerald-950/30 dark:via-zinc-950 dark:to-zinc-950 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/25">
            <PlusIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create task
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Rich descriptions get better AI summaries and priorities.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Title
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              placeholder="e.g. Launch onboarding checklist"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Description
            </label>
            <textarea
              className="min-h-[110px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              placeholder="Context, scope, blockers, stakeholders…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Priority
              </label>
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                value={useAutoPriority ? "auto" : priority}
                disabled={submitting}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "auto") {
                    setUseAutoPriority(true);
                  } else {
                    setUseAutoPriority(false);
                    setPriority(v as TaskPriority);
                  }
                }}
              >
                <option value="auto">Auto (AI suggested)</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Due date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            {submitting ? (
              <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "Create task"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
