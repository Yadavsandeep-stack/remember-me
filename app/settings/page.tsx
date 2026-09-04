"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleAlert,
  Download,
  Globe,
  Lock,
  Mail,
  Save,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";

const timezones = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return router.push("/login");

      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, timezone")
        .eq("id", user.id)
        .maybeSingle();

      setName(data?.full_name ?? user.user_metadata?.full_name ?? "");
      setTimezone(
        data?.timezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone ??
          "UTC"
      );
      setLoading(false);
    }

    load();
  }, [router]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return router.push("/login");

    const { error: saveError } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim() || null,
        timezone,
      })
      .eq("id", user.id);

    if (saveError) {
      setError("We couldn't save your settings. Please try again.");
    } else {
      setMessage("Settings saved successfully.");
    }
    setSaving(false);
  }

  async function exportData() {
    setExporting(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return router.push("/login");

    const [people, events, reminders] = await Promise.all([
      supabase.from("people").select("*").eq("user_id", user.id),
      supabase.from("events").select("*").eq("user_id", user.id),
      supabase.from("reminders").select("*").eq("user_id", user.id),
    ]);

    if (people.error || events.error || reminders.error) {
      setError("We couldn't prepare your export. Please try again.");
      setExporting(false);
      return;
    }

    const exportObject = {
      exported_at: new Date().toISOString(),
      user_email: email,
      people: people.data,
      events: events.data,
      reminders: reminders.data,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rememberme-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="h-96 animate-pulse rounded-3xl border border-border/60 bg-card/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AppHeader userEmail={email} userName={name} />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <User className="h-6 w-6" />
          </div>

          <h1 className="font-heading mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Account & Settings
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your profile, timezone, and personal data.
          </p>
        </div>

        {/* Profile Settings Form */}
        <form
          onSubmit={save}
          className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Profile & Regional
            </h2>
            <p className="text-xs text-muted-foreground">
              Your account details and preferred timezone for alerts.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Email (Readonly) */}
          <div>
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="mt-2 h-11 w-full rounded-2xl border border-border/50 bg-muted/60 px-4 text-sm font-medium text-muted-foreground cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Your primary sign-in and notification destination.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label
              htmlFor="timezone"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            >
              {[...new Set([timezone, ...timezones])].map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ensures your reminders arrive in the morning of your local timezone.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving settings..." : "Save Settings"}
            </button>
          </div>
        </form>

        {/* Data Portability Section */}
        <section className="glass-panel mt-8 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Download className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-heading text-lg font-bold text-foreground">
                Export Your Data
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Download a clean, structured JSON file containing all your people, custom milestones, and reminder configurations anytime.
              </p>

              <button
                type="button"
                onClick={exportData}
                disabled={exporting}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-4 py-2.5 text-xs font-semibold text-foreground backdrop-blur-md transition hover:bg-muted hover:scale-105 active:scale-95 shadow-xs disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? "Preparing export..." : "Download JSON Backup"}
              </button>
            </div>
          </div>
        </section>

        {/* Security / Password Recovery */}
        <section className="glass-panel mt-6 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Shield className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-heading text-lg font-bold text-foreground">
                Security & Password
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Protect your account with a secure password. Request a reset email to change your credentials.
              </p>

              <Link
                href="/forgot-password"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-4 py-2.5 text-xs font-semibold text-foreground backdrop-blur-md transition hover:bg-muted hover:scale-105 active:scale-95 shadow-xs"
              >
                <Lock className="h-3.5 w-3.5" />
                Change Password
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
