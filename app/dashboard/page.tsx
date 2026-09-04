"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Cake,
  CalendarDays,
  ChevronRight,
  LogOut,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { daysUntil, getNextOccurrence } from "@/lib/dates";

type Person = {
  id: string;
  name: string;
  dob: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  notes: string | null;
  created_at: string;
};

type Event = {
  id: string;
  person_id: string;
  title: string;
  event_type: string;
  event_date: string;
  is_recurring: boolean;
};

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("All");
  const [sort, setSort] = useState("name-asc");

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const [peopleResult, eventsResult] = await Promise.all([
        supabase.from("people").select("*").eq("user_id", user.id).order("name", { ascending: true }),
        supabase.from("events").select("id, person_id, title, event_type, event_date, is_recurring").eq("user_id", user.id),
      ]);

      if (peopleResult.error || eventsResult.error) {
        setError("We couldn't load your dashboard. Please refresh and try again.");
        setLoading(false);
        return;
      }

      setPeople(peopleResult.data ?? []);
      setEvents(eventsResult.data ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
  }

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

  function formatBirthday(dob: string) {
    const date = new Date(`${dob}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
    });
  }

  const upcomingPeople = useMemo(() => {
    return people
      .filter((person) => person.dob)
      .sort(
        (a, b) =>
          getNextBirthday(a.dob!).getTime() -
          getNextBirthday(b.dob!).getTime()
      )
      .slice(0, 5);
  }, [people]);

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results = people.filter(
      (person) =>
        (!query || person.name.toLowerCase().includes(query) || person.relationship?.toLowerCase().includes(query)) &&
        (relationshipFilter === "All" || person.relationship === relationshipFilter)
    );
    return results.sort((first, second) => {
      if (sort === "name-desc") return second.name.localeCompare(first.name);
      if (sort === "recent") return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
      if (sort === "upcoming") return (first.dob ? getNextBirthday(first.dob).getTime() : Number.MAX_SAFE_INTEGER) - (second.dob ? getNextBirthday(second.dob).getTime() : Number.MAX_SAFE_INTEGER);
      return first.name.localeCompare(second.name);
    });
  }, [people, relationshipFilter, search, sort]);

  const relationships = useMemo(() => ["All", ...new Set(people.map((person) => person.relationship).filter((value): value is string => Boolean(value)))], [people]);

  const nextBirthday = upcomingPeople[0];
  const upcomingEvents = useMemo(() => events
    .map((event) => ({ ...event, occurrence: getNextOccurrence({ date: event.event_date, isRecurring: event.is_recurring }) }))
    .filter((event) => event.occurrence >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((first, second) => first.occurrence.getTime() - second.occurrence.getTime())
    .slice(0, 3), [events]);

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CalendarDays className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold tracking-tight">
              RememberMe
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/calendar")}
              className="hidden rounded-lg border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted sm:inline-flex"
            >
              Calendar
            </button>
            <button
              onClick={() => router.push("/settings")}
              aria-label="Settings"
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:flex"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Welcome section */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Your personal date manager
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back 👋
              </h1>

              <p className="mt-2 max-w-xl text-muted-foreground">
                Keep the important people and moments in your life close.
                We&apos;ll help you remember the dates that matter.
              </p>

              {email && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {email}
                </p>
              )}
            </div>

            <button
              onClick={() => router.push("/people/new")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add person
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl border bg-background"
                />
              ))}
            </div>

            <div className="h-64 animate-pulse rounded-2xl border bg-background" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <section className="mb-8 grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      People saved
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {people.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">Events tracked</p><p className="mt-1 text-3xl font-bold">{events.length}</p></div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600"><CalendarDays className="h-5 w-5" /></div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Birthdays tracked
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {people.filter((person) => person.dob).length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                    <Cake className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Next birthday
                    </p>

                    <p className="mt-1 truncate text-lg font-bold">
                      {nextBirthday?.name ?? "Nothing yet"}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </section>

            {/* Empty state */}
            {people.length === 0 ? (
              <section className="rounded-2xl border bg-background px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays className="h-8 w-8" />
                </div>

                <h2 className="mt-6 text-2xl font-bold">
                  Start remembering what matters
                </h2>

                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Add your first person and their important dates. RememberMe
                  will help make sure you never forget them.
                </p>

                <button
                  onClick={() => router.push("/people/new")}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add your first person
                </button>
              </section>
            ) : (
              <>
                {/* Upcoming birthdays */}
                {upcomingPeople.length > 0 && (
                  <section className="mb-10">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Coming up
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          The next important birthdays on your list.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {upcomingPeople.map((person) => {
                        const days = getDaysUntilBirthday(person.dob!);

                        return (
                          <button
                            key={person.id}
                            onClick={() =>
                              router.push(`/people/${person.id}`)
                            }
                            className="group rounded-2xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                  {person.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate font-semibold">
                                    {person.name}
                                  </h3>

                                  <p className="truncate text-sm text-muted-foreground">
                                    {person.relationship || "Person"}
                                  </p>
                                </div>
                              </div>

                              <Cake className="h-5 w-5 shrink-0 text-orange-500" />
                            </div>

                            <div className="mt-5 flex items-end justify-between">
                              <div>
                                <p className="font-medium">
                                  {formatBirthday(person.dob!)}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  {days === 0
                                    ? "Today 🎉"
                                    : days === 1
                                      ? "Tomorrow"
                                      : `In ${days} days`}
                                </p>
                              </div>

                              <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {upcomingEvents.length > 0 && (
                  <section className="mb-10">
                    <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold tracking-tight">Upcoming events</h2><p className="mt-1 text-sm text-muted-foreground">Your next anniversaries and important moments.</p></div><button onClick={() => router.push("/calendar")} className="text-sm font-medium text-primary">View calendar</button></div>
                    <div className="grid gap-4 md:grid-cols-3">{upcomingEvents.map((event) => { const person = people.find((item) => item.id === event.person_id); const days = daysUntil(event.occurrence); return <button key={event.id} onClick={() => router.push(`/people/${event.person_id}/events/${event.id}/edit`)} className="rounded-2xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="font-semibold">{event.title}</p><p className="mt-1 text-sm text-muted-foreground">{person?.name ?? "Person"} · {event.event_type}</p><p className="mt-5 text-sm font-medium">{days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}</p></button>; })}</div>
                  </section>
                )}

                {/* All people */}
                <section>
                  <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">
                        All people
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Everyone you&apos;re keeping track of.
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <div className="relative w-full sm:w-72">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search people..."
                        className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <select aria-label="Filter by relationship" value={relationshipFilter} onChange={(event) => setRelationshipFilter(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm">{relationships.map((relationship) => <option key={relationship}>{relationship}</option>)}</select>
                    <select aria-label="Sort people" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm"><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="upcoming">Upcoming birthday</option><option value="recent">Recently added</option></select>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                    {filteredPeople.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <Search className="mx-auto h-8 w-8 text-muted-foreground" />

                        <p className="mt-3 font-medium">
                          No people found
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Try a different name or relationship.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredPeople.map((person) => (
                          <div
                            key={person.id}
                            className="flex flex-col gap-4 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                                {person.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {person.name}
                                </p>

                                <p className="truncate text-sm text-muted-foreground">
                                  {person.relationship || "Person"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                              {person.dob && (
                                <div className="hidden text-right sm:block">
                                  <p className="text-sm font-medium">
                                    {formatBirthday(person.dob)}
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    Birthday
                                  </p>
                                </div>
                              )}

                              <button
                                onClick={() =>
                                  router.push(`/people/${person.id}/reminder`)
                                }
                                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                              >
                                <Bell className="h-4 w-4" />
                                Reminder
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
