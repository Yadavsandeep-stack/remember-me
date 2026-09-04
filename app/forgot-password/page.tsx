"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    const { error: requestError } = await createClient()
      .auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    if (requestError) {
      setError("We couldn't send a reset email. Please try again.");
    } else {
      setStatus(
        "If an account exists for that email, a secure reset link has been dispatched."
      );
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-32 -left-32 h-96 w-96 bg-indigo-500/15" />
      <div className="ambient-glow -bottom-32 -right-32 h-96 w-96 bg-purple-500/15" />

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center transition-transform hover:scale-105 active:scale-95"
          >
            <Logo size="lg" />
          </Link>

          <h1 className="font-heading mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Reset your password
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            We&apos;ll send you a secure link to choose a new password.
          </p>
        </div>

        {/* Reset Form */}
        <form
          onSubmit={submit}
          className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          <div>
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              Account Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
              <CircleAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Status */}
          {status && (
            <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{status}</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Sending link..." : "Send Reset Link"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Back to Login */}
        <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
