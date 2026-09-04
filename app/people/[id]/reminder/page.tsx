"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Cake,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  Save,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";

const reminderPresets = [
  { label: "Day of event", value: "0", desc: "Morning of the milestone" },
  { label: "1 day before", value: "1", desc: "Best for quick text/call" },
  { label: "3 days before", value: "3", desc: "Great for planning dinner" },
  { label: "7 days before", value: "7", desc: "Time to buy & ship gifts" },
  { label: "14 days before", value: "14", desc: "Best for large gatherings" },
];

export default function ReminderPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;

  const [daysBefore, setDaysBefore] = useState("1");
  const [emailReminder, setEmailReminder] = useState(true);
  const [reminderId, setReminderId] = useState<string | null>(null);

  const [personName, setPersonName] = useState("");
  const [personDob, setPersonDob] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReminder() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? "");

      const { data: person, error: personError } = await supabase
        .from("people")
        .select("name, dob")
        .eq("id", personId)
        .eq("user_id", user.id)
        .single();

      if (personError || !person) {
        setError("Unable to find this person.");
        setLoading(false);
        return;
      }

      setPersonName(person.name);
      setPersonDob(person.dob);

      const { data, error: reminderError } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("person_id", personId)
        .maybeSingle();

      if (reminderError) {
        setError(reminderError.message);
        setLoading(false);
        return;
      }

      if (data) {
        setReminderId(data.id);
        setDaysBefore(String(data.days_before));
        setEmailReminder(data.send_email);
      }

      setLoading(false);
    }

    loadReminder();
  }, [personId, router]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (reminderId) {
      const { error: updateError } = await supabase
        .from("reminders")
        .update({
          days_before: Number(daysBefore),
          send_email: emailReminder,
        })
        .eq("id", reminderId)
        .eq("user_id", user.id);

      if (updateError) {
        setError("We could not save your reminder settings.");
        setSaving(false);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("reminders")
        .insert({
          user_id: user.id,
          person_id: personId,
          days_before: Number(daysBefore),
          send_email: emailReminder,
        })
        .select("id")
        .single();

      if (insertError) {
        setError("We could not save your reminder settings.");
        setSaving(false);
        return;
      }

      if (data) setReminderId(data.id);
    }

    setMessage("Reminder settings saved successfully.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!reminderId) return;

    setDeleting(true);
    const supabase = createClient();
    const { error: delErr } = await supabase
      .from("reminders")
      .delete()
      .eq("id", reminderId);

    if (delErr) {
      setError("Failed to remove reminder.");
      setDeleting(false);
      return;
    }

    setReminderId(null);
    setDaysBefore("1");
    setMessage("Reminder removed.");
    setDeleting(false);
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
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/people/${personId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {personName}
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20">
            <Bell className="h-6 w-6" />
          </div>

          <h1 className="font-heading mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Configure Reminders
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Set up smart notification timing for{" "}
            <span className="font-semibold text-foreground">{personName}</span>.
          </p>
        </div>

        {/* Main Settings Card */}
        <div className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Preset Chips */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Notify Me In Advance
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {reminderPresets.map((preset) => {
                const isSelected = daysBefore === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setDaysBefore(preset.value)}
                    className={`flex flex-col items-start rounded-2xl p-4 text-left transition-all ${
                      isSelected
                        ? "border-2 border-primary bg-primary/10 shadow-md shadow-primary/15"
                        : "border border-border/70 bg-card/60 hover:bg-muted/70 hover:border-border"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-heading text-sm font-bold text-foreground">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Notification Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 p-4.5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">
                  Email Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Send alert to {userEmail || "your email"}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={emailReminder}
              onClick={() => setEmailReminder(!emailReminder)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                emailReminder ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  emailReminder ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Email Simulation Preview Card */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              LIVE EMAIL ALERT PREVIEW
            </div>

            <div className="mt-3 rounded-xl border border-border/80 bg-background/90 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-2">
                <span>From: RememberMe Alerts</span>
                <span>To: {userEmail || "you@example.com"}</span>
              </div>
              <p className="mt-3 font-heading font-bold text-sm text-foreground">
                🎂 {personName}&apos;s Birthday is{" "}
                {daysBefore === "0"
                  ? "Today!"
                  : daysBefore === "1"
                  ? "Tomorrow!"
                  : `in ${daysBefore} days!`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Don&apos;t forget to wish {personName} and celebrate their special day.
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-12 w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving settings..." : "Save Reminder Settings"}
            </button>

            {reminderId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-5 font-semibold text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}