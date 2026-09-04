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

export default function NewEventPage() {
  const router = useRouter();
  const params = useParams();

  const personId = params.id as string;

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
    async function loadPerson() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: person, error } = await supabase
        .from("people")
        .select("name")
        .eq("id", personId)
        .eq("user_id", user.id)
        .single();

      if (error || !person) {
        setError("Unable to find this person.");
        setLoading(false);
        return;
      }

      setPersonName(person.name);
      setLoading(false);
    }

    loadPerson();
  }, [personId, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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

    if (!title.trim()) {
      setError("Please enter an event name.");
      setSaving(false);
      return;
    }

    if (!eventDate) {
      setError("Please select an event date.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      person_id: personId,
      title: title.trim(),
      event_type: eventType,
      event_date: eventDate,
      is_recurring: isRecurring,
      description: description.trim() || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Event created successfully.");

    setTimeout(() => {
      router.push(`/people/${personId}`);
    }, 800);
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

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
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
        {/* Heading */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Add an important date
          </h1>

          <p className="mt-2 text-muted-foreground">
            Create an event for{" "}
            <span className="font-medium text-foreground">
              {personName}
            </span>
            .
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm"
        >
          <div className="space-y-6 p-6">
            {/* Event name */}
            <div>
              <label
                htmlFor="title"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Tag className="h-4 w-4 text-muted-foreground" />
                Event name
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Birthday, Graduation, Anniversary"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Event type */}
            <div>
              <label
                htmlFor="eventType"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Event type
              </label>

              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="eventDate"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Date
              </label>

              <input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Recurring */}
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
                onClick={() => setIsRecurring(!isRecurring)}
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

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                Notes
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any useful details about this event..."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {message}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/20 p-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save event"}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-5 flex gap-3 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
          <User className="mt-0.5 h-4 w-4 shrink-0" />

          <p>
            This event will be saved under{" "}
            <span className="font-medium text-foreground">
              {personName}
            </span>
            . You can configure reminders for it afterward.
          </p>
        </div>
      </div>
    </main>
  );
}