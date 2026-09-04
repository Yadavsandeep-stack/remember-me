"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-32 -left-32 h-96 w-96 bg-destructive/15" />
      <div className="ambient-glow -bottom-32 -right-32 h-96 w-96 bg-purple-500/15" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="glass-panel overflow-hidden rounded-3xl p-8 sm:p-10 shadow-2xl space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
            Something went wrong
          </h1>

          <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">
            An unexpected error occurred while loading this page. You can try refreshing or returning to the dashboard.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:scale-105 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>

            <Link
              href="/dashboard"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-5 text-xs font-semibold text-foreground backdrop-blur-md hover:bg-muted"
            >
              <Home className="h-4 w-4" /> Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
