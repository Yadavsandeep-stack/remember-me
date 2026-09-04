"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CircleAlert,
  Clock,
  Mail,
  Save,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type EventDetails = {
  title: string;
  event_date: string;
  is_recurring: boolean;
};

export default function EventReminderPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;
  const eventId = params.eventId as string;

  const [personName, setPersonName] = useState("");
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [reminderId, setReminderId] = useState<string | null>(null);
  const [daysBefore, setDaysBefore] = useState("1");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      const [personResult, eventResult, reminderResult] = await Promise.all([
        supabase
          .from("people")
          .select("name")
          .eq("id", personId)
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("events")
          .select("title, event_date, is_recurring")
          .eq("id", eventId)
          .eq("person_id", personId)
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("reminders")
          .select("id, days_before, send_email")
          .eq("person_id", personId)
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (
        personResult.error ||
        !personResult.data ||
        eventResult.error ||
        !eventResult.data ||
        reminderResult.error
      ) {
        setError("We couldn't load this event reminder.");
        setLoading(false);
        return;
      }

      setPersonName(personResult.data.name);
      setEvent(eventResult.data);

      if (reminderResult.data) {
        setReminderId(reminderResult.data.id);
        setDaysBefore(String(reminderResult.data.days_before));
        setSendEmail(reminderResult.data.send_email);
      }

      setLoading(false);
    }

    loadReminder();
  }, [eventId, personId, router]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const reminderValues = {
      days_before: Number(daysBefore),
      send_email: sendEmail,
      enabled: true,
    };

    const result = reminderId
      ? await supabase
          .from("reminders")
          .update(reminderValues)
          .eq("id", reminderId)
          .eq("person_id", personId)
          .eq("event_id", eventId)
          .eq("user_id", user.id)
      : await supabase
          .from("reminders")
          .insert({
            ...reminderValues,
            user_id: user.id,
            person_id: personId,
            event_id: eventId,
            send_push: false,
          })
          .select("id")
          .single();

    if (result.error) {
      setError("We couldn't save this reminder. Please try again.");
      setSaving(false);
      return;
    }

    if (!reminderId && "data" in result && result.data) {
      setReminderId(result.data.id);
    }

    setMessage("Event reminder saved successfully.");
    setSaving(false);
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
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

  if (error && !event) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Bell className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => router.push(`/people/${personId}`)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to person
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push(`/people/${personId}`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {personName || "person"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Event reminder</h1>
          <p className="mt-2 text-muted-foreground">
            Choose when to be reminded about{" "}
            <span className="font-medium text-foreground">{event?.title}</span>.
          </p>
        </div>

        {event && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl border bg-background p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{event.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatDate(event.event_date)}
                {event.is_recurring ? " · Repeats every year" : " · One-time event"}
              </p>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-semibold">Reminder timing</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Decide how early you want to be notified.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label htmlFor="daysBefore" className="text-sm font-medium">
              Remind me
            </label>
            <select
              id="daysBefore"
              value={daysBefore}
              onChange={(inputEvent) => setDaysBefore(inputEvent.target.value)}
              className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="0">On the event day</option>
              <option value="1">1 day before</option>
              <option value="2">2 days before</option>
              <option value="3">3 days before</option>
              <option value="7">7 days before</option>
              <option value="14">14 days before</option>
              <option value="30">30 days before</option>
            </select>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email reminder</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Receive this reminder in your email.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sendEmail}
                onClick={() => setSendEmail((currentValue) => !currentValue)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  sendEmail ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    sendEmail ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                <Check className="h-4 w-4" />
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save reminder"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
