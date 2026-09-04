"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleAlert, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { daysUntil, formatDate, getNextOccurrence } from "@/lib/dates";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data, error: loadError } = await supabase
        .from("events")
        .select("id, person_id, title, event_type, event_date, is_recurring, people(name)")
        .eq("user_id", user.id);
      if (loadError) setError("We couldn't load your calendar.");
      else setItems((data ?? []) as Item[]);
      setLoading(false);
    }
    load();
  }, [router]);

  const types = ["All", ...new Set(items.map((item) => item.event_type))];
  const visibleItems = useMemo(() => items
    .filter((item) => type === "All" || item.event_type === type)
    .sort((first, second) => getNextOccurrence({ date: first.event_date, isRecurring: first.is_recurring }).getTime() - getNextOccurrence({ date: second.event_date, isRecurring: second.is_recurring }).getTime()), [items, type]);

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6"><button onClick={() => router.push("/dashboard")} className="font-bold">RememberMe</button><button onClick={() => router.push("/people/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Add person</button></div></header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold">Calendar</h1><p className="mt-2 text-muted-foreground">Every important event, ordered by what is next.</p></div><select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm">{types.map((value) => <option key={value}>{value}</option>)}</select></div>
      {error && <div className="mt-6 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><CircleAlert className="h-4 w-4" />{error}</div>}
      {loading ? <div className="mt-8 h-64 animate-pulse rounded-2xl border bg-background" /> : visibleItems.length === 0 ? <div className="mt-8 rounded-2xl border bg-background p-12 text-center"><CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-4 font-semibold">No events to show</h2><p className="mt-1 text-sm text-muted-foreground">Add an important date from a person&apos;s page.</p></div> : <div className="mt-8 divide-y overflow-hidden rounded-2xl border bg-background">{visibleItems.map((item) => { const occurrence = getNextOccurrence({ date: item.event_date, isRecurring: item.is_recurring }); const person = Array.isArray(item.people) ? item.people[0] : item.people; const remaining = daysUntil(occurrence); return <button key={item.id} onClick={() => router.push(`/people/${item.person_id}/events/${item.id}/edit`)} className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-muted/50"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{person?.name ?? "Person"} · {item.event_type}</p></div><div className="text-right"><p className="font-medium">{formatDate(occurrence.toISOString().slice(0, 10), true)}</p><p className="mt-1 text-sm text-muted-foreground">{remaining === 0 ? "Today" : remaining === 1 ? "Tomorrow" : `In ${remaining} days`}</p></div></button>; })}</div>}</div>
    </main>
  );
}
