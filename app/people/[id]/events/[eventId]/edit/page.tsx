"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  CheckCircle2,
  FileText,
  Repeat,
  Save,
  Tag,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";

const eventTypes = [
  "Anniversary",
  "Birthday",
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
  const [deleting, setDeleting] = useState(false);

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
            .select("title, event_type, event_date, is_recurring, description")
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
      setError("Please enter an event title.");
      setSaving(false);
      return;
    }

    if (!eventDate) {
      setError("Please select an event date.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: title.trim(),
        event_type: eventType,
        event_date: eventDate,
        is_recurring: isRecurring,
        description: description.trim() || null,
      })
      .eq("id", eventId)
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Milestone updated successfully.");
    setSaving(false);

    setTimeout(() => {
      router.push(`/people/${personId}`);
    }, 600);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    setDeleting(true);
    const supabase = createClient();
    const { error: delErr } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (delErr) {
      setError("Failed to delete event.");
      setDeleting(false);
      return;
    }

    router.push(`/people/${personId}`);
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
            Back to {personName || "Person"}
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            Edit Milestone
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Update event information for {personName}.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Tag className="h-3.5 w-3.5 text-primary" />
              Event Name <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Category
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {eventTypes.map((type) => {
                const isSelected = eventType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                        : "border border-border/70 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="eventDate"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              Date <span className="text-destructive">*</span>
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Recurring Switch */}
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 p-4.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Repeat className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">
                  Repeat Every Year
                </p>
                <p className="text-xs text-muted-foreground">
                  Automatically roll over to the next occurrence.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isRecurring}
              onClick={() => setIsRecurring(!isRecurring)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isRecurring ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  isRecurring ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              Notes / Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-border/70 bg-card/80 p-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving changes..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-6 font-semibold text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
