"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (password.length < 6) return setError("Use at least 6 characters."); if (password !== confirmPassword) return setError("Passwords do not match."); setLoading(true); const { error: updateError } = await createClient().auth.updateUser({ password }); if (updateError) { setError("This reset link is invalid or expired. Request a new one."); setLoading(false); return; } router.push("/dashboard"); }
  return <main className="flex min-h-screen items-center justify-center px-6"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border p-6"><h1 className="text-3xl font-bold">Choose a new password</h1><p className="mt-2 text-muted-foreground">Use a strong password you do not use elsewhere.</p><label className="mt-6 block text-sm font-medium">New password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" /></label><label className="mt-4 block text-sm font-medium">Confirm password<input required minLength={6} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" /></label>{error && <p className="mt-4 text-sm text-destructive">{error}</p>}<button disabled={loading} className="mt-6 h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">{loading ? "Updating..." : "Update password"}</button></form></main>;
}
