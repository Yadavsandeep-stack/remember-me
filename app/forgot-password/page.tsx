"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [status, setStatus] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); const { error: requestError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (requestError) setError("We couldn't send a reset email. Please try again."); else setStatus("If an account exists for that email, a reset link is on its way."); setLoading(false); }
  return <main className="flex min-h-screen items-center justify-center px-6"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border p-6"><Link href="/login" className="text-sm text-muted-foreground">Back to login</Link><h1 className="mt-6 text-3xl font-bold">Reset your password</h1><p className="mt-2 text-muted-foreground">We&apos;ll email you a secure reset link.</p><label className="mt-6 block text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" /></label>{error && <p className="mt-4 text-sm text-destructive">{error}</p>}{status && <p className="mt-4 text-sm text-green-700">{status}</p>}<button disabled={loading} className="mt-6 h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button></form></main>;
}
