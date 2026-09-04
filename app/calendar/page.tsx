"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Calendar,
  ChevronRight,
  CircleAlert,
  Filter,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { daysUntil, formatDate, getNextOccurrence } from "@/lib/dates";
import { AppHeader } from "@/components/app-header";
import { BadgePill } from "@/components/ui/badge-pill";

type Item = {
  id: string;
  person_id: string;
  title: string;
  event_type: string;
  event_date: string;
  is_recurring: boolean;
  people: { name: string } | { name: string }[] | null;
};

export default function CalendarPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return router.push("/login");

      const { data, error: loadError } = await supabase
        .from("events")
        .select(
          "id, person_id, title, event_type, event_date, is_recurring, people(name)"
        )
        .eq("user_id", user.id);

      if (loadError) setError("We couldn't load your calendar.");
      else setItems((data ?? []) as Item[]);

      setLoading(false);
    }
    load();
  }, [router]);

  const types = ["All", ...new Set(items.map((item) => item.event_type))];

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((item) => {
        const person = Array.isArray(item.people)
          ? item.people[0]
          : item.people;
        const personName = person?.name?.toLowerCase() || "";
        const title = item.title.toLowerCase();
        const matchesQuery = !q || personName.includes(q) || title.includes(q);
        const matchesType = type === "All" || item.event_type === type;
        return matchesQuery && matchesType;
      })
      .map((item) => ({
        ...item,
        occurrence: getNextOccurrence({
          date: item.event_date,
          isRecurring: item.is_recurring,
        }),
      }))
      .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime());
  }, [items, type, search]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Title & Filter Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Chronological Timeline
            </div>

            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Calendar & Milestones
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every important date in your circle, ordered by what is coming up next.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
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

            {/* Type selector */}
            <select
              aria-label="Filter events by type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 rounded-2xl border border-border/70 bg-card/80 px-3 text-xs font-medium outline-none transition focus:border-primary backdrop-blur-md"
            >
              {types.map((val) => (
                <option key={val} value={val}>
                  {val === "All" ? "All Categories" : val}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
            <CircleAlert className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-3xl border border-border/60 bg-card/60"
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center shadow-lg">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h2 className="font-heading mt-4 text-xl font-bold">
              No milestones found
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted-foreground">
              {search || type !== "All"
                ? "Try clearing your search query or choosing another category."
                : "Add birthdays and important dates to your people to view them here."}
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="glass-panel divide-y divide-border/60 overflow-hidden rounded-3xl shadow-xl">
            {visibleItems.map((item) => {
              const person = Array.isArray(item.people)
                ? item.people[0]
                : item.people;
              const remaining = daysUntil(item.occurrence);
              const isToday = remaining === 0;
              const isTomorrow = remaining === 1;

              return (
                <div
                  key={item.id}
                  onClick={() =>
                    router.push(
                      `/people/${item.person_id}/events/${item.id}/edit`
                    )
                  }
                  className="flex flex-col gap-4 p-5 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading font-bold text-foreground text-base">
                          {item.title}
                        </p>
                        <BadgePill
                          label={item.event_type}
                          variant="event"
                          size="sm"
                        />
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        For{" "}
                        <span className="font-semibold text-foreground">
                          {person?.name ?? "Person"}
                        </span>
                        {item.is_recurring && " • Repeats annually"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-foreground">
                        {formatDate(
                          item.occurrence.toISOString().slice(0, 10),
                          true
                        )}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          isToday
                            ? "text-amber-600 dark:text-amber-400"
                            : isTomorrow
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isToday
                          ? "Today 🎉"
                          : isTomorrow
                          ? "Tomorrow"
                          : `In ${remaining} days`}
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center text-muted-foreground">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
