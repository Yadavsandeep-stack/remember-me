"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setError("We couldn't create your account. Please check your details and try again.");
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    if (data.user) {
      setMessage(
        "Account created. Check your email, confirm your address, then you will be signed in."
      );
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold"
          >
            RememberMe
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-muted-foreground">
            Start remembering important dates.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5 rounded-xl border p-6"
        >

          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Sandeep Yadav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}
