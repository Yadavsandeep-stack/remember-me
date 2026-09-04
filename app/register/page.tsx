"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setError(
        "We couldn't create your account. Please check your details and try again."
      );
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    if (data.user) {
      setMessage(
        "Account created! Please check your email to confirm your address, then sign in."
      );
    }

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-32 -right-32 h-96 w-96 bg-purple-500/15" />
      <div className="ambient-glow -bottom-32 -left-32 h-96 w-96 bg-indigo-500/15" />

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
            Create your account
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            Start remembering the dates and people who matter.
          </p>
        </div>

        {/* Register Glass Card */}
        <form
          onSubmit={handleRegister}
          className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Sandeep Yadav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              Password (min. 6 characters)
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                className="h-11 w-full rounded-2xl border border-border/70 bg-card/80 pl-4 pr-11 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
              <CircleAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Login CTA */}
        <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
