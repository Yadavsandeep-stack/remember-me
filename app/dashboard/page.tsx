"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Cake,
  CalendarDays,
  ChevronRight,
  Filter,
  Grid3X3,
  Heart,
  LayoutList,
  Mail,
  PartyPopper,
  Phone,
  Plus,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { daysUntil, getNextOccurrence } from "@/lib/dates";
import { AppHeader } from "@/components/app-header";
import { BadgePill } from "@/components/ui/badge-pill";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { CelebrationBanner } from "@/components/ui/celebration-banner";

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
  const [userName, setUserName] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("All");
  const [sort, setSort] = useState("upcoming");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      setUserName(user.user_metadata?.full_name ?? "");

      const [peopleResult, eventsResult] = await Promise.all([
        supabase
          .from("people")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true }),
        supabase
          .from("events")
          .select("id, person_id, title, event_type, event_date, is_recurring")
          .eq("user_id", user.id),
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

  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  const upcomingPeople = useMemo(() => {
    return people
      .filter((person) => person.dob)
      .sort(
        (a, b) =>
          getNextBirthday(a.dob!).getTime() - getNextBirthday(b.dob!).getTime()
      )
      .slice(0, 6);
  }, [people]);

  const upcomingEvents = useMemo(
    () =>
      events
        .map((event) => ({
          ...event,
          occurrence: getNextOccurrence({
            date: event.event_date,
            isRecurring: event.is_recurring,
          }),
        }))
        .filter(
          (event) =>
            event.occurrence >= new Date(new Date().setHours(0, 0, 0, 0))
        )
        .sort(
          (first, second) =>
            first.occurrence.getTime() - second.occurrence.getTime()
        )
        .slice(0, 4),
    [events]
  );

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results = people.filter(
      (person) =>
        (!query ||
          person.name.toLowerCase().includes(query) ||
          person.relationship?.toLowerCase().includes(query) ||
          person.notes?.toLowerCase().includes(query)) &&
        (relationshipFilter === "All" ||
          person.relationship === relationshipFilter)
    );
    return results.sort((first, second) => {
      if (sort === "name-desc") return second.name.localeCompare(first.name);
      if (sort === "recent")
        return (
          new Date(second.created_at).getTime() -
          new Date(first.created_at).getTime()
        );
      if (sort === "upcoming")
        return (
          (first.dob ? getNextBirthday(first.dob).getTime() : Number.MAX_SAFE_INTEGER) -
          (second.dob ? getNextBirthday(second.dob).getTime() : Number.MAX_SAFE_INTEGER)
        );
      return first.name.localeCompare(second.name);
    });
  }, [people, relationshipFilter, search, sort]);

  const relationships = useMemo(
    () => [
      "All",
      ...new Set(
        people
          .map((person) => person.relationship)
          .filter((value): value is string => Boolean(value))
      ),
    ],
    [people]
  );

  // Prepare milestones for CelebrationBanner
  const celebrationMilestones = useMemo(() => {
    const milestones: Array<{
      id: string;
      name: string;
      title: string;
      type: "birthday" | "event";
      daysRemaining: number;
      personId: string;
      email?: string | null;
      phone?: string | null;
    }> = [];

    people.forEach((p) => {
      if (p.dob) {
        const days = getDaysUntilBirthday(p.dob);
        if (days === 0 || days === 1) {
          milestones.push({
            id: `bday-${p.id}`,
            name: p.name,
            title: "Birthday",
            type: "birthday",
            daysRemaining: days,
            personId: p.id,
            email: p.email,
            phone: p.phone,
          });
        }
      }
    });

    events.forEach((e) => {
      const occurrence = getNextOccurrence({
        date: e.event_date,
        isRecurring: e.is_recurring,
      });
      const days = daysUntil(occurrence);
      if (days === 0 || days === 1) {
        const person = people.find((p) => p.id === e.person_id);
        milestones.push({
          id: `event-${e.id}`,
          name: person?.name ?? "Special Someone",
          title: e.title,
          type: "event",
          daysRemaining: days,
          personId: e.person_id,
          email: person?.email,
          phone: person?.phone,
        });
      }
    });

    return milestones;
  }, [people, events]);

  const nextBirthday = upcomingPeople[0];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <AppHeader userEmail={email} userName={userName} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Personal Milestone Intelligence
              </div>

              <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                {getTimeGreeting()},{" "}
                <span className="gradient-text">
                  {userName || email.split("@")[0] || "Friend"}
                </span>{" "}
                👋
              </h1>

              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Keep the important people and moments close. Here is everything happening in your circle.
              </p>
            </div>

            <Link
              href="/people/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:opacity-95 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add person
            </Link>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Celebration Banner for Today/Tomorrow */}
        <CelebrationBanner milestones={celebrationMilestones} />

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-3xl border border-border/60 bg-card/60"
                />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-3xl border border-border/60 bg-card/60" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
              {/* Stat 1 */}
              <div className="glass-panel card-hover-lift rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      People Saved
                    </p>
                    <p className="font-heading mt-1.5 text-2xl font-extrabold sm:text-3xl">
                      {people.length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="glass-panel card-hover-lift rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Events Tracked
                    </p>
                    <p className="font-heading mt-1.5 text-2xl font-extrabold sm:text-3xl">
                      {events.length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="glass-panel card-hover-lift rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Birthdays
                    </p>
                    <p className="font-heading mt-1.5 text-2xl font-extrabold sm:text-3xl">
                      {people.filter((p) => p.dob).length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Cake className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="glass-panel card-hover-lift rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Next Birthday
                    </p>
                    <p className="font-heading mt-1.5 truncate text-lg font-bold sm:text-xl">
                      {nextBirthday?.name ?? "None yet"}
                    </p>
                    {nextBirthday?.dob && (
                      <p className="text-xs text-primary font-medium">
                        {getDaysUntilBirthday(nextBirthday.dob) === 0
                          ? "Today 🎉"
                          : `In ${getDaysUntilBirthday(nextBirthday.dob)} days`}
                      </p>
                    )}
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <PartyPopper className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </section>

            {/* Empty State */}
            {people.length === 0 ? (
              <section className="glass-panel rounded-3xl p-12 text-center shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <CalendarDays className="h-8 w-8" />
                </div>

                <h2 className="font-heading mt-6 text-2xl font-bold">
                  Start remembering what matters
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                  Add your first person and their important dates. RememberMe will help make sure you never miss a birthday or anniversary.
                </p>

                <Link
                  href="/people/new"
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Add your first person
                </Link>
              </section>
            ) : (
              <>
                {/* Upcoming Birthdays Section */}
                {upcomingPeople.length > 0 && (
                  <section className="mb-12">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                          Upcoming Birthdays 🎂
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                          The next birthdays in your circle, sorted by closest date.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {upcomingPeople.map((person) => {
                        const days = getDaysUntilBirthday(person.dob!);
                        const isToday = days === 0;
                        const isTomorrow = days === 1;

                        return (
                          <div
                            key={person.id}
                            className={`glass-panel card-hover-lift group relative overflow-hidden rounded-3xl p-5 cursor-pointer ${
                              isToday
                                ? "border-amber-500/40 bg-amber-500/5"
                                : isTomorrow
                                ? "border-rose-500/30 bg-rose-500/5"
                                : ""
                            }`}
                            onClick={() => router.push(`/people/${person.id}`)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <AvatarBadge name={person.name} size="md" />

                                <div className="min-w-0">
                                  <h3 className="truncate font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                                    {person.name}
                                  </h3>
                                  <div className="mt-0.5 flex items-center gap-1.5">
                                    {person.relationship && (
                                      <BadgePill
                                        label={person.relationship}
                                        variant="relationship"
                                        size="sm"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  isToday
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse"
                                    : isTomorrow
                                    ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isToday
                                  ? "Today 🎉"
                                  : isTomorrow
                                  ? "Tomorrow"
                                  : `In ${days}d`}
                              </span>
                            </div>

                            <div className="mt-5 flex items-end justify-between border-t border-border/50 pt-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Birthday</p>
                                <p className="text-sm font-semibold text-foreground">
                                  {formatBirthday(person.dob!)}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/people/${person.id}/reminder`);
                                  }}
                                  title="Configure Reminder"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition hover:border-primary/40 hover:text-primary hover:scale-105"
                                >
                                  <Bell className="h-3.5 w-3.5" />
                                </button>
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Upcoming Events Section */}
                {upcomingEvents.length > 0 && (
                  <section className="mb-12">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                          Special Milestones ✨
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                          Anniversaries, graduations, and custom dates coming up.
                        </p>
                      </div>
                      <Link
                        href="/calendar"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                      >
                        View Calendar
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {upcomingEvents.map((event) => {
                        const person = people.find((p) => p.id === event.person_id);
                        const days = daysUntil(event.occurrence);

                        return (
                          <div
                            key={event.id}
                            onClick={() =>
                              router.push(
                                `/people/${event.person_id}/events/${event.id}/edit`
                              )
                            }
                            className="glass-panel card-hover-lift group cursor-pointer rounded-3xl p-5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <BadgePill
                                label={event.event_type}
                                variant="event"
                                size="sm"
                              />
                              <span className="text-xs font-medium text-muted-foreground">
                                {days === 0
                                  ? "Today"
                                  : days === 1
                                  ? "Tomorrow"
                                  : `In ${days}d`}
                              </span>
                            </div>

                            <h3 className="font-heading mt-3 truncate text-base font-bold group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            <p className="truncate text-xs text-muted-foreground">
                              {person?.name ?? "Person"}
                            </p>

                            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs font-medium text-primary">
                              <span>View details</span>
                              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* All People Directory Hub */}
                <section>
                  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                      <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                        Your Circle ({filteredPeople.length})
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                        Everyone you are keeping track of.
                      </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search people..."
                          className="h-10 w-full rounded-2xl border border-border/70 bg-card/80 pl-9 pr-8 text-xs font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
                        />
                        {search && (
                          <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Relationship Filter */}
                      <select
                        aria-label="Filter by relationship"
                        value={relationshipFilter}
                        onChange={(e) => setRelationshipFilter(e.target.value)}
                        className="h-10 rounded-2xl border border-border/70 bg-card/80 px-3 text-xs font-medium outline-none transition focus:border-primary backdrop-blur-md"
                      >
                        {relationships.map((rel) => (
                          <option key={rel} value={rel}>
                            {rel === "All" ? "All Circles" : rel}
                          </option>
                        ))}
                      </select>

                      {/* Sort Dropdown */}
                      <select
                        aria-label="Sort people"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="h-10 rounded-2xl border border-border/70 bg-card/80 px-3 text-xs font-medium outline-none transition focus:border-primary backdrop-blur-md"
                      >
                        <option value="upcoming">Upcoming Birthday</option>
                        <option value="name-asc">Name A → Z</option>
                        <option value="name-desc">Name Z → A</option>
                        <option value="recent">Recently Added</option>
                      </select>

                      {/* View Mode Toggle */}
                      <div className="hidden sm:flex items-center rounded-2xl border border-border/70 bg-card/80 p-1 backdrop-blur-md">
                        <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                            viewMode === "grid"
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="Grid View"
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                            viewMode === "list"
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="List View"
                        >
                          <LayoutList className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* People Content */}
                  {filteredPeople.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-12 text-center">
                      <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-3 font-heading font-bold text-foreground">
                        No matches found
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try a different search keyword or clear your relationship filters.
                      </p>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredPeople.map((person) => (
                        <div
                          key={person.id}
                          onClick={() => router.push(`/people/${person.id}`)}
                          className="glass-panel card-hover-lift group relative cursor-pointer rounded-3xl p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <AvatarBadge name={person.name} size="md" />

                              <div className="min-w-0">
                                <h3 className="font-heading truncate font-bold group-hover:text-primary transition-colors">
                                  {person.name}
                                </h3>
                                <div className="mt-1">
                                  <BadgePill
                                    label={person.relationship || "Contact"}
                                    variant="relationship"
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 flex items-end justify-between border-t border-border/50 pt-3 text-xs">
                            <div>
                              {person.dob ? (
                                <>
                                  <span className="text-muted-foreground">Birthday</span>
                                  <p className="font-semibold text-foreground">
                                    {formatBirthday(person.dob)}
                                  </p>
                                </>
                              ) : (
                                <span className="text-muted-foreground italic">
                                  No birthday saved
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/people/${person.id}/reminder`);
                                }}
                                title="Set reminder"
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition hover:text-primary hover:border-primary/40"
                              >
                                <Bell className="h-3.5 w-3.5" />
                              </button>
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel divide-y divide-border/60 overflow-hidden rounded-3xl">
                      {filteredPeople.map((person) => (
                        <div
                          key={person.id}
                          onClick={() => router.push(`/people/${person.id}`)}
                          className="flex flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:p-5 cursor-pointer"
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            <AvatarBadge name={person.name} size="md" />

                            <div className="min-w-0">
                              <p className="font-heading font-bold text-foreground hover:text-primary transition-colors">
                                {person.name}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2">
                                <BadgePill
                                  label={person.relationship || "Contact"}
                                  variant="relationship"
                                  size="sm"
                                />
                                {person.email && (
                                  <span className="hidden text-xs text-muted-foreground md:inline">
                                    • {person.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            {person.dob && (
                              <div className="text-right">
                                <p className="text-xs font-semibold text-foreground">
                                  {formatBirthday(person.dob)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  Birthday
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/people/${person.id}/reminder`);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md transition hover:bg-muted"
                              >
                                <Bell className="h-3.5 w-3.5 text-primary" />
                                Reminder
                              </button>
                              <div className="flex h-8 w-8 items-center justify-center text-muted-foreground">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
