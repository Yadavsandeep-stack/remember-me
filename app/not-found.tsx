import Link from "next/link";
import { ArrowLeft, CalendarDays, Home, Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-32 -left-32 h-96 w-96 bg-indigo-500/15" />
      <div className="ambient-glow -bottom-32 -right-32 h-96 w-96 bg-rose-500/15" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="glass-panel overflow-hidden rounded-3xl p-8 sm:p-10 shadow-2xl space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Search className="h-8 w-8" />
          </div>

          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            404
          </h1>

          <h2 className="font-heading text-lg font-bold text-foreground">
            Page Not Found
          </h2>

          <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:scale-105 active:scale-95"
            >
              <Home className="h-4 w-4" /> Go to Dashboard
            </Link>

            <Link
              href="/"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-5 text-xs font-semibold text-foreground backdrop-blur-md hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
