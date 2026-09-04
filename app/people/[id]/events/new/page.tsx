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
  User,
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

export default function NewEventPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;

  const [personName, setPersonName] = useState("");
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Anniversary");
  const [eventDate, setEventDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
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

    setMessage("Milestone added successfully.");

    setTimeout(() => {
      router.push(`/people/${personId}`);
    }, 600);
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <CalendarDays className="h-6 w-6" />
          </div>

          <h1 className="font-heading mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Add a milestone for {personName}
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Track anniversaries, graduations, work promotions, or custom special dates.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          {/* Event Title */}
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
              placeholder="e.g. Wedding Anniversary, PhD Defense"
              required
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Event Type Chips */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Event Category
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

          {/* Event Date */}
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
                  Automatically schedule the next occurrence annually.
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
              placeholder="e.g. Celebrated at Olive Bistro, 5-year milestone"
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-border/70 bg-card/80 p-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
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

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving milestone..." : "Save Milestone"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}