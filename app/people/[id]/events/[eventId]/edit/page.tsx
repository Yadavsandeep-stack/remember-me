"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  FileText,
  Save,
  Tag,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const eventTypes = [
  "Birthday",
  "Anniversary",
  "Graduation",
  "Work Anniversary",
  "Relationship",
  "Custom",
];

type EventRecord = {
  title: string;
  event_type: string;
  event_date: string;
  is_recurring: boolean;
  description: string | null;
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();

  const personId = params.id as string;
  const eventId = params.eventId as string;

  const [personName, setPersonName] = useState("");
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Custom");
  const [eventDate, setEventDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEvent() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [{ data: person, error: personError }, { data: event, error: eventError }] =
        await Promise.all([
          supabase
            .from("people")
            .select("name")
            .eq("id", personId)
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("events")
            .select(
              "title, event_type, event_date, is_recurring, description"
            )
            .eq("id", eventId)
            .eq("person_id", personId)
            .eq("user_id", user.id)
            .single(),
        ]);

      if (personError || !person || eventError || !event) {
        setError("We couldn't find this event.");
        setLoading(false);
        return;
      }

      const eventRecord = event as EventRecord;
      setPersonName(person.name);
      setTitle(eventRecord.title);
      setEventType(eventRecord.event_type);
      setEventDate(eventRecord.event_date);
      setIsRecurring(eventRecord.is_recurring);
      setDescription(eventRecord.description ?? "");
      setLoading(false);
    }

    loadEvent();
  }, [eventId, personId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Please enter an event name.");
      return;
    }

    if (!eventDate) {
      setError("Please select an event date.");
      return;
    }

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

    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: trimmedTitle,
        event_type: eventType,
        event_date: eventDate,
        is_recurring: isRecurring,
        description: description.trim() || null,
      })
      .eq("id", eventId)
      .eq("person_id", personId)
      .eq("user_id", user.id);

    if (updateError) {
      setError("We couldn't save your changes. Please try again.");
      setSaving(false);
      return;
    }

    setMessage("Event updated successfully.");
    setTimeout(() => router.push(`/people/${personId}`), 800);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-24 animate-pulse rounded-2xl border bg-background" />
          <div className="mt-6 h-[520px] animate-pulse rounded-2xl border bg-background" />
        </div>
      </main>
    );
  }

  if (error && !personName) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <CalendarDays className="h-6 w-6" />
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
            <CalendarDays className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit event</h1>
          <p className="mt-2 text-muted-foreground">
            Update an important date for{" "}
            <span className="font-medium text-foreground">{personName}</span>.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm"
        >
          <div className="space-y-6 p-6">
            <div>
              <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Event name
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(inputEvent) => setTitle(inputEvent.target.value)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="eventType" className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Event type
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(inputEvent) => setEventType(inputEvent.target.value)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eventDate" className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Date
              </label>
              <input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(inputEvent) => setEventDate(inputEvent.target.value)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Repeat every year</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Useful for birthdays and anniversaries.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isRecurring}
                onClick={() => setIsRecurring((currentValue) => !currentValue)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  isRecurring ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    isRecurring ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Notes
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(inputEvent) => setDescription(inputEvent.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                <Check className="h-4 w-4" />
                {message}
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t bg-muted/20 p-6">
            <button
              type="button"
              onClick={() => router.push(`/people/${personId}`)}
              disabled={saving}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border bg-background text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        <div className="mt-5 flex gap-3 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
          <User className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This event is saved under{" "}
            <span className="font-medium text-foreground">{personName}</span>.
          </p>
        </div>
      </div>
    </main>
  );
}
