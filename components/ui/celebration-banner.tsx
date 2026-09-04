"use client";

import React from "react";
import { Cake, Sparkles, Mail, Phone, ArrowRight, PartyPopper } from "lucide-react";
import Link from "next/link";

type Milestone = {
  id: string;
  name: string;
  title: string;
  type: "birthday" | "event";
  daysRemaining: number;
  personId: string;
  email?: string | null;
  phone?: string | null;
};

export function CelebrationBanner({ milestones }: { milestones: Milestone[] }) {
  if (!milestones || milestones.length === 0) return null;

  const todayMilestones = milestones.filter((m) => m.daysRemaining === 0);
  const tomorrowMilestones = milestones.filter((m) => m.daysRemaining === 1);

  if (todayMilestones.length === 0 && tomorrowMilestones.length === 0) return null;

  const current = todayMilestones[0] || tomorrowMilestones[0];
  const isToday = current.daysRemaining === 0;

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
      {/* Decorative glowing backdrops */}
      <div className="ambient-glow -top-12 -left-12 h-40 w-40 bg-amber-500/20" />
      <div className="ambient-glow -bottom-12 -right-12 h-40 w-40 bg-rose-500/20" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20 animate-bounce">
            {isToday ? (
              <PartyPopper className="h-6 w-6" />
            ) : (
              <Cake className="h-6 w-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
                {isToday ? "TODAY'S CELEBRATION" : "HAPPENING TOMORROW"}
              </span>
            </div>

            <h3 className="mt-1.5 text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {current.name}&apos;s {current.title}!
            </h3>

            <p className="mt-0.5 text-sm text-muted-foreground">
              {isToday
                ? `Don't forget to reach out and wish ${current.name} today.`
                : `Get ready to celebrate ${current.name}'s special day tomorrow.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {current.email && (
            <a
              href={`mailto:${current.email}?subject=Happy ${current.title}!`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3.5 text-xs font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted hover:scale-105 active:scale-95"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              Email
            </a>
          )}

          {current.phone && (
            <a
              href={`tel:${current.phone}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3.5 text-xs font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted hover:scale-105 active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              Call
            </a>
          )}

          <Link
            href={`/people/${current.personId}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:scale-105 active:scale-95"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
