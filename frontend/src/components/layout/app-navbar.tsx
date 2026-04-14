"use client";

import Link from "next/link";
import type { SessionUser } from "@/lib/session";

type AppNavbarProps = {
  user: SessionUser | null;
  onLogout: () => void;
};

export function AppNavbar({ user, onLogout }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard"
          className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          AI Task Manager
        </Link>
        <span className="hidden h-4 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
        <span className="hidden truncate text-xs text-zinc-500 dark:text-zinc-400 sm:block">
          Workspace
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden max-w-[200px] truncate text-xs text-zinc-600 dark:text-zinc-400 md:block">
          {user?.email}
        </span>
        <Link
          href="/"
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          Home
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
