import { MarketingNav } from "@/components/layout/marketing-nav";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <MarketingNav />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}
