"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match. Please verify.");
    }

    setLoading(true);
    const { error: updateError } = await createClient()
      .auth.updateUser({ password });

    if (updateError) {
      setError(
        "This reset link is invalid or expired. Please request a new one."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
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
            className="inline-flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <CalendarDays className="h-6 w-6" />
            </div>
            <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
              Remember<span className="gradient-text">Me</span>
            </span>
          </Link>

          <h1 className="font-heading mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Choose a new password
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            Please enter and confirm your new secure password.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={submit}
          className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              New Password (min. 6 characters)
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-2xl border border-border/70 bg-card/80 pl-4 pr-11 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Updating password..." : "Update Password"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
