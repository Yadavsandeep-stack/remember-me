"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Cake,
  Check,
  Clock,
  Mail,
  Save,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function ReminderPage() {
  const router = useRouter();
  const params = useParams();

  const personId = params.id as string;

  const [daysBefore, setDaysBefore] = useState("1");
  const [emailReminder, setEmailReminder] = useState(true);
  const [reminderId, setReminderId] = useState<string | null>(null);

  const [personName, setPersonName] = useState("");
  const [personDob, setPersonDob] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const { data: person, error: personError } = await supabase
        .from("people")
        .select("name, dob")
        .eq("id", personId)
        .eq("user_id", user.id)
        .single();

      if (personError) {
        setError("Unable to find this person.");
        setLoading(false);
        return;
      }

      setPersonName(person.name);
      setPersonDob(person.dob);

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("person_id", personId)
        .maybeSingle();

      if (error) {
        setError(error.message);
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
      const { error } = await supabase
        .from("reminders")
        .update({
          days_before: Number(daysBefore),
          send_email: emailReminder,
          enabled: true,
        })
        .eq("id", reminderId)
        .eq("user_id", user.id);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setMessage("Reminder updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("reminders")
        .insert({
          user_id: user.id,
          person_id: personId,
          days_before: Number(daysBefore),
          send_email: emailReminder,
          send_push: false,
          enabled: true,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setReminderId(data.id);
      setMessage("Reminder saved successfully.");
    }

    setSaving(false);

    setTimeout(() => {
      router.push(`/people/${personId}`);
    }, 900);
  }

  function formatBirthday(dob: string) {
    return new Date(`${dob}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />

          <div className="mt-8 h-28 animate-pulse rounded-2xl border bg-background" />

          <div className="mt-6 h-80 animate-pulse rounded-2xl border bg-background" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6">
          <button
            onClick={() => router.push(`/dashboard`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Title */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Birthday reminder
          </h1>

          <p className="mt-2 text-muted-foreground">
            Choose when RememberMe should remind you about{" "}
            <span className="font-medium text-foreground">
              {personName}
            </span>
            .
          </p>
        </div>

        {/* Birthday summary */}
        {personDob && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl border bg-background p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <Cake className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Birthday
              </p>

              <p className="mt-0.5 font-semibold">
                {formatBirthday(personDob)}
              </p>
            </div>
          </div>
        )}

        {/* Settings card */}
        <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />

              <div>
                <h2 className="font-semibold">
                  Reminder timing
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Decide how early you want to be notified.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="text-sm font-medium">
              Remind me
            </label>

            <select
              value={daysBefore}
              onChange={(e) => setDaysBefore(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="0">On the birthday</option>
              <option value="1">1 day before</option>
              <option value="2">2 days before</option>
              <option value="3">3 days before</option>
              <option value="7">7 days before</option>
              <option value="14">14 days before</option>
              <option value="30">30 days before</option>
            </select>

            {/* Email toggle */}
            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Email reminder
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Receive the reminder in your email.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={emailReminder}
                onClick={() => setEmailReminder(!emailReminder)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  emailReminder ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    emailReminder ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Feedback */}
            {message && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {message}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {saving ? "Saving..." : "Save reminder"}
            </button>
          </div>
        </section>

        {/* Info */}
        <div className="mt-5 flex gap-3 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
          <Bell className="mt-0.5 h-4 w-4 shrink-0" />

          <p>
            RememberMe will automatically check your reminders every
            day and send your email reminder when it&apos;s due.
          </p>
        </div>
      </div>
    </main>
  );
}