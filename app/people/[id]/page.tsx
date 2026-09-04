"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Cake,
  Calendar,
  CalendarDays,
  Clock,
  Edit,
  Mail,
  MoreVertical,
  PartyPopper,
  Phone,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { daysUntil, getNextOccurrence, formatDate } from "@/lib/dates";
import { AppHeader } from "@/components/app-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { BadgePill } from "@/components/ui/badge-pill";

type Person = {
  id: string;
  name: string;
  relationship: string | null;
  dob: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type Event = {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  is_recurring: boolean;
  description: string | null;
};

export default function PersonDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

      // Load person
      const { data: personData, error: personError } = await supabase
        .from("people")
        .select("*")
        .eq("id", personId)
        .eq("user_id", user.id)
        .single();

      if (personError || !personData) {
        setError("Unable to find this person.");
        setLoading(false);
        return;
      }

      setPerson(personData);

      // Load events for this person
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, title, event_type, event_date, is_recurring, description")
        .eq("person_id", personId)
        .eq("user_id", user.id)
        .order("event_date", { ascending: true });

      if (eventError) {
        setError(eventError.message);
        setLoading(false);
        return;
      }

      setEvents(eventData || []);
      setLoading(false);
    }

    loadPerson();
  }, [personId, router]);

  function getNextBirthday(dob: string) {
    const today = new Date();
    const birthDate = new Date(`${dob}T00:00:00`);

    let birthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (birthday < today) {
      birthday = new Date(
        today.getFullYear() + 1,
        birthDate.getMonth(),
        birthDate.getDate()
      );
    }

    return birthday;
  }

  function getDaysUntilBirthday(dob: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthday = getNextBirthday(dob);
    birthday.setHours(0, 0, 0, 0);

    const difference = birthday.getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }

  function calculateAge(dob: string) {
    const birthDate = new Date(`${dob}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  async function handleDeletePerson() {
    try {
      setDeleting(true);
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("people")
        .delete()
        .eq("id", personId);

      if (deleteError) throw deleteError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to delete person.");
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    const supabase = createClient();
    const { error: delErr } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (delErr) {
      setError("Failed to delete event.");
      return;
    }

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="h-44 animate-pulse rounded-3xl border border-border/60 bg-card/60" />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="h-64 animate-pulse rounded-3xl border border-border/60 bg-card/60" />
            <div className="h-64 animate-pulse rounded-3xl border border-border/60 bg-card/60" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <p className="text-destructive font-semibold">Person not found.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const daysToBirthday = person.dob ? getDaysUntilBirthday(person.dob) : null;
  const currentAge = person.dob ? calculateAge(person.dob) : null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {/* Hero Profile Card */}
        <section className="glass-panel relative mb-8 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="ambient-glow -top-16 -right-16 h-48 w-48 bg-indigo-500/15" />
          
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Left: Avatar & Identity */}
            <div className="flex items-center gap-5">
              <AvatarBadge name={person.name} size="xl" />

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-heading text-2xl font-extrabold sm:text-3xl text-foreground">
                    {person.name}
                  </h1>
                  {person.relationship && (
                    <BadgePill
                      label={person.relationship}
                      variant="relationship"
                      size="md"
                    />
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {currentAge !== null && (
                    <span className="font-semibold text-foreground">
                      {currentAge} years old
                    </span>
                  )}
                  {person.email && <span>• {person.email}</span>}
                  {person.phone && <span>• {person.phone}</span>}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/people/${person.id}/reminder`}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-4 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted/80 hover:scale-105 active:scale-95 shadow-xs"
              >
                <Bell className="h-4 w-4 text-primary" />
                Reminders
              </Link>

              <Link
                href={`/people/${person.id}/events/new`}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-4 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </Link>

              <Link
                href={`/people/${person.id}/edit`}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/80 text-muted-foreground transition-all hover:text-foreground hover:scale-105 active:scale-95 shadow-xs"
                title="Edit profile"
              >
                <Edit className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/80 text-muted-foreground transition-all hover:border-destructive/40 hover:text-destructive hover:scale-105 active:scale-95 shadow-xs"
                title="Delete person"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column (1 col): Countdown & Contact Details */}
          <div className="space-y-6 lg:col-span-1">
            {/* Birthday Spotlight */}
            {person.dob ? (
              <div className="glass-panel card-hover-lift rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Next Birthday
                  </span>
                  <Cake className="h-5 w-5 text-amber-500" />
                </div>

                <p className="font-heading mt-3 text-2xl font-bold">
                  {new Date(`${person.dob}T00:00:00`).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long" }
                  )}
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {daysToBirthday === 0
                    ? "Celebrating Today! 🎉"
                    : daysToBirthday === 1
                    ? "Happening Tomorrow!"
                    : `${daysToBirthday} days remaining`}
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Next turning:</span>
                  <span className="font-semibold">
                    {currentAge !== null ? currentAge + 1 : "?"} years old
                  </span>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-6 text-center">
                <Cake className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                <p className="mt-3 text-sm font-semibold">No birthday saved</p>
                <Link
                  href={`/people/${person.id}/edit`}
                  className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  + Add date of birth
                </Link>
              </div>
            )}

            {/* Contact & Notes Card */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Contact & Notes
              </h3>

              <div className="mt-4 space-y-3.5 text-sm">
                {person.email ? (
                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-3 transition hover:border-primary/40 hover:bg-muted/60"
                  >
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate text-xs font-medium">{person.email}</span>
                  </a>
                ) : null}

                {person.phone ? (
                  <a
                    href={`tel:${person.phone}`}
                    className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-3 transition hover:border-emerald-500/40 hover:bg-muted/60"
                  >
                    <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="truncate text-xs font-medium">{person.phone}</span>
                  </a>
                ) : null}

                {person.notes && (
                  <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Personal Notes
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                      {person.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (2 cols): Milestones & Events Timeline */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-border/60 pb-5">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Milestones & Events ({events.length})
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Anniversaries, graduations, and custom dates tracked for {person.name}.
                  </p>
                </div>

                <Link
                  href={`/people/${person.id}/events/new`}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border/70 bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition hover:bg-muted"
                >
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  Add Event
                </Link>
              </div>

              {events.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="mt-3 font-heading font-bold text-foreground">
                    No custom events added yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Track anniversaries, promotions, or special dates for {person.name}.
                  </p>
                  <Link
                    href={`/people/${person.id}/events/new`}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" /> Add First Event
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {events.map((event) => {
                    const occurrence = getNextOccurrence({
                      date: event.event_date,
                      isRecurring: event.is_recurring,
                    });
                    const days = daysUntil(occurrence);

                    return (
                      <div
                        key={event.id}
                        className="glass-panel card-hover-lift rounded-2xl p-4.5 sm:p-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-heading font-bold text-foreground">
                                {event.title}
                              </h4>
                              <BadgePill
                                label={event.event_type}
                                variant="event"
                                size="sm"
                              />
                              {event.is_recurring && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  Yearly
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(event.event_date, false)}
                              {event.description && ` • ${event.description}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            {days === 0
                              ? "Today 🎉"
                              : days === 1
                              ? "Tomorrow"
                              : `In ${days} days`}
                          </span>

                          <div className="flex items-center gap-1">
                            <Link
                              href={`/people/${person.id}/events/${event.id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:text-foreground"
                              title="Edit event"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                              title="Delete event"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Person Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel max-w-md rounded-3xl p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="font-heading mt-4 text-xl font-bold">
              Delete {person.name}?
            </h3>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This will permanently delete this person, along with all associated milestones, custom events, and reminder configurations. This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-2xl border border-border/80 bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePerson}
                disabled={deleting}
                className="rounded-2xl bg-destructive px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
