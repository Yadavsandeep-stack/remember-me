"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Cake,
  CalendarDays,
  Edit,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Person = {
  id: string;
  name: string;
  relationship: string | null;
  dob: string;
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
  const [eventActionMessage, setEventActionMessage] = useState("");
  const [deletingEventId, setDeletingEventId] = useState<string | null>(
    null
  );

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
        .select(
          "id, title, event_type, event_date, is_recurring, description"
        )
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

  function formatBirthday(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
    });
  }

  function formatEventDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function calculateAge(dob: string) {
    const birthDate = new Date(`${dob}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${person?.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("people")
      .delete()
      .eq("id", personId)
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  async function handleDeleteEvent(event: Event) {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingEventId(event.id);
    setEventActionMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id)
      .eq("user_id", user.id)
      .eq("person_id", personId);

    if (deleteError) {
      setEventActionMessage("We couldn't delete this event. Please try again.");
      setDeletingEventId(null);
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter((currentEvent) => currentEvent.id !== event.id)
    );
    setEventActionMessage("Event deleted successfully.");
    setDeletingEventId(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />

          <div className="mt-8 h-56 animate-pulse rounded-2xl border bg-background" />

          <div className="mt-6 h-72 animate-pulse rounded-2xl border bg-background" />
        </div>
      </main>
    );
  }

  if (error || !person) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <User className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Person not found
          </h1>

          <p className="mt-2 text-muted-foreground">
            {error || "We couldn't find this person."}
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Person header */}
        <section className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                {person.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {person.name}
                </h1>

                {person.relationship && (
                  <p className="mt-1 text-muted-foreground">
                    {person.relationship}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  router.push(`/people/${personId}/events/new`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add event
              </button>

              <button
                onClick={() =>
                  router.push(`/people/${personId}/reminder`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                <Bell className="h-4 w-4" />
                Reminder
              </button>
            </div>
          </div>
        </section>

        {/* Birthday */}
        <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <Cake className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Birthday
              </p>

              <p className="mt-0.5 text-lg font-semibold">
                {formatBirthday(person.dob)}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {calculateAge(person.dob)} years old
              </p>
            </div>
          </div>
        </section>

        {/* Contact information */}
        {(person.email || person.phone) && (
          <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Contact information
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {person.email && (
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm font-medium">
                      {person.email}
                    </p>
                  </div>
                </div>
              )}

              {person.phone && (
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {person.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Events */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b p-6">
            <div>
              <h2 className="text-lg font-semibold">
                Important dates
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Birthdays, anniversaries and other memorable dates.
              </p>
            </div>

            <button
              onClick={() =>
                router.push(`/people/${personId}/events/new`)
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                Add event
              </span>
            </button>
          </div>

          {eventActionMessage && (
            <div className="mx-6 mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
              {eventActionMessage}
            </div>
          )}

          {events.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <CalendarDays className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-semibold">
                No important dates yet
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Add anniversaries, graduations, work anniversaries
                or any other important date.
              </p>

              <button
                onClick={() =>
                  router.push(`/people/${personId}/events/new`)
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add your first event
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarDays className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.event_type}
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        {formatEventDate(event.event_date)}
                      </p>

                      {event.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {event.is_recurring ? (
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Every year
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        One-time
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/people/${personId}/events/${event.id}/edit`
                        )
                      }
                      aria-label={`Edit ${event.title}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/people/${personId}/events/${event.id}/reminder`
                        )
                      }
                      aria-label={`Configure a reminder for ${event.title}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                    >
                      <Bell className="h-4 w-4" />
                      Reminder
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event)}
                      disabled={deletingEventId === event.id}
                      aria-label={`Delete ${event.title}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingEventId === event.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        {person.notes && (
          <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Notes
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {person.notes}
            </p>
          </section>
        )}

        {/* Bottom actions */}
        <section className="mt-6 flex flex-col gap-3 rounded-2xl border bg-background p-6 shadow-sm sm:flex-row">
          <button
  onClick={() => router.push(`/people/${personId}/edit`)}
  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
>
  <Edit className="h-4 w-4" />
  Edit person
</button>

          <button
            onClick={handleDelete}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete person
          </button>
        </section>
      </div>
    </main>
  );
}
