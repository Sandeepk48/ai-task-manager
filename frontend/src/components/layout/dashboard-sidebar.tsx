"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [{ href: "/dashboard", label: "Tasks", icon: ListIcon }];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40 lg:flex">
      <div className="p-4">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Menu
        </p>
        <nav className="mt-3 flex flex-col gap-0.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-800"
                    : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t border-zinc-200/80 p-4 dark:border-zinc-800">
        <p className="px-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          New tasks get an AI summary and suggested priority from your
          description.
        </p>
      </div>
    </aside>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
