"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MarketingNav() {
  const pathname = usePathname();
  const onLogin = pathname === "/login";

  return (
    <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          AI Task Manager
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {onLogin ? (
            <Link
              href="/signup"
              className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign up
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
