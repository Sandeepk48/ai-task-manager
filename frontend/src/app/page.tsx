import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-24">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            AI Task Manager
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
            Plan tasks faster with summaries and smart priority hints.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            This starter wires a Next.js dashboard to a NestJS API with JWT
            authentication, Prisma + PostgreSQL models, and optional OpenAI
            enrichment whenever you create a task.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-white dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full px-6 py-3 text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
            >
              Open dashboard
            </Link>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Secure auth",
              body: "Email + password with hashed storage and JWT access tokens.",
            },
            {
              title: "Task intelligence",
              body: "Each task stores AI-written summaries plus suggested priority levels.",
            },
            {
              title: "Typed stack",
              body: "TypeScript end-to-end with Prisma models powering the REST API.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{item.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
