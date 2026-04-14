"use client";

import Link from "next/link";
import type { SessionUser } from "@/lib/session";
import { AppNavbar } from "./app-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardLayoutProps = {
  user: SessionUser | null;
  onLogout: () => void;
  children: React.ReactNode;
};

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-100 dark:bg-zinc-950">
      <AppNavbar user={user} onLogout={onLogout} />
      <div className="flex border-b border-zinc-200 bg-zinc-50/90 px-4 py-2.5 lg:hidden dark:border-zinc-800 dark:bg-zinc-900/50">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
        >
          Tasks
        </Link>
      </div>
      <div className="flex min-h-0 flex-1">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
