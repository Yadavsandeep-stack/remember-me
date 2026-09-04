"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Cake,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Gift,
  Heart,
  Mail,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do the email reminders work?",
      a: "When you add a person or milestone, you can choose how far in advance you want an alert (e.g. on the day, 1 day before, 3 days before, or 1 week before). RememberMe automatically sends a notification directly to your verified inbox.",
    },
    {
      q: "Is my personal contacts data private?",
      a: "Yes, 100%. Your contacts, birthdays, notes, and milestones are secured with strict row-level security. We never sell or share your data with third parties, and you can export or delete your data at any time.",
    },
    {
      q: "Can I track custom events other than birthdays?",
      a: "Absolutely! You can track Anniversaries, Graduations, Work Anniversaries, Relationship milestones, and any custom recurring or one-time events you desire.",
    },
    {
      q: "Is RememberMe completely free to use?",
      a: "Yes, you can create an account and track unlimited people and dates completely free.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-40 -left-40 h-[600px] w-[600px] bg-indigo-500/15 dark:bg-indigo-600/20" />
      <div className="ambient-glow top-1/4 -right-40 h-[500px] w-[500px] bg-purple-500/15 dark:bg-purple-600/20" />
      <div className="ambient-glow bottom-20 left-1/3 h-[500px] w-[500px] bg-rose-500/10 dark:bg-pink-600/15" />

      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50 transition-colors">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <Logo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-foreground">
              How It Works
            </a>
            <a href="#testimonials" className="transition hover:text-foreground">
              Reviews
            </a>
            <a href="#faq" className="transition hover:text-foreground">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-xl border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted/80 hover:scale-105 active:scale-95 shadow-xs"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:opacity-95 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center justify-center px-6 pt-20 pb-24 text-center lg:pt-28">
        {/* Shimmer Pill Badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 overflow-hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 backdrop-blur-md shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
          <span>The Next-Generation Milestone & Birthday Hub</span>
        </div>

        <h1 className="font-heading max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
          Remember the people <br className="hidden sm:inline" />
          who <span className="gradient-text">make life special.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl sm:leading-relaxed">
          Keep birthdays, anniversaries, and personal milestones beautifully organized.
          Receive smart, timely alerts in your inbox before the day arrives.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/register"
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-8 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
          >
            Start Free in 30 Seconds
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-6 font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted/80 hover:scale-105 active:scale-95 shadow-xs"
          >
            Explore Features
          </a>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>100% Private & Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            <span>Automated Smart Reminders</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
            <span>No Credit Card Required</span>
          </div>
        </div>

        {/* Hero Interactive Mockup Card */}
        <div className="relative mt-16 w-full max-w-4xl">
          <div className="ambient-glow -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-70 blur-2xl" />
          
          <div className="glass-panel relative rounded-3xl p-6 sm:p-8 text-left shadow-2xl">
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold">Upcoming Highlights</h3>
                  <p className="text-xs text-muted-foreground">Next 7 days in your circle</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ● 3 Alerts Active
              </span>
            </div>

            {/* Mock Milestone Items */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {/* Item 1: Birthday Today */}
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 transition hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-sm shadow-sm">
                    SK
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 animate-pulse">
                    Today 🎉
                  </span>
                </div>
                <h4 className="mt-3 font-bold text-foreground">Sarah Kapoor</h4>
                <p className="text-xs text-muted-foreground">Turning 28 • Family</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <span className="flex items-center gap-1">
                    <Cake className="h-3.5 w-3.5" /> Birthday
                  </span>
                  <span>Wish now →</span>
                </div>
              </div>

              {/* Item 2: Anniversary in 2 days */}
              <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-pink-500/5 p-4 transition hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white font-bold text-sm shadow-sm">
                    M&D
                  </div>
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    In 2 days
                  </span>
                </div>
                <h4 className="mt-3 font-bold text-foreground">Mom & Dad</h4>
                <p className="text-xs text-muted-foreground">30th Anniversary • Family</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-rose-500/20 text-xs font-medium text-rose-700 dark:text-rose-300">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" /> Anniversary
                  </span>
                  <span>Gift ready</span>
                </div>
              </div>

              {/* Item 3: Graduation in 5 days */}
              <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-4 transition hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-sm">
                    AL
                  </div>
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    In 5 days
                  </span>
                </div>
                <h4 className="mt-3 font-bold text-foreground">Alex Liu</h4>
                <p className="text-xs text-muted-foreground">Master&apos;s Degree • Friend</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-indigo-500/20 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  <span className="flex items-center gap-1">
                    <PartyPopper className="h-3.5 w-3.5" /> Graduation
                  </span>
                  <span>Party 7 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-border/70 bg-muted/40 backdrop-blur-md py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          <div>
            <p className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">10,000+</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Dates Remembered</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">100%</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">On-Time Smart Alerts</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-purple-600 dark:text-purple-400 sm:text-4xl">0%</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Spam or Data Tracking</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-rose-600 dark:text-rose-400 sm:text-4xl">4.9 ★</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">User Delight Score</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Designed for genuine connection.
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            Everything you need to stay thoughtful, reliable, and connected with friends, family, and colleagues.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="glass-panel card-hover-lift rounded-3xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="font-heading mt-6 text-xl font-bold">Predictive Smart Reminders</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Choose your alert timing: same day, 1 day, 3 days, or 1 week before. Get ample notice to order gifts, write cards, and plan dinner.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel card-hover-lift rounded-3xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Cake className="h-6 w-6" />
            </div>
            <h3 className="font-heading mt-6 text-xl font-bold">Multi-Event Timelines</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Track birthdays, wedding anniversaries, job promotions, graduations, and custom life milestones under one profile.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel card-hover-lift rounded-3xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-heading mt-6 text-xl font-bold">Privacy-First Architecture</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Protected by PostgreSQL Row-Level Security. We will never sell, analyze, or monetize your contact records.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel card-hover-lift rounded-3xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-heading mt-6 text-xl font-bold">One-Click Actions</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Tap directly on a celebration alert to fire off an email or initiate a call straight from your device without digging for info.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel card-hover-lift rounded-3xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="font-heading mt-6 text-xl font-bold">Chronological Calendar</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              View all upcoming milestones grouped neatly by month, sorted chronologically with intuitive countdown badges.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel card-hover-lift rounded-3xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-heading mt-6 text-xl font-bold">Relationship Organization</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Tag people by Family, Friend, Partner, or Colleague. Filter and find contact details and personal notes in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border/70 bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              Simple, reliable, and effortless.
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Set up your circle in minutes and never miss a key date again.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="glass-panel relative rounded-3xl p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
                1
              </div>
              <h3 className="font-heading mt-6 text-xl font-bold">Add Your People</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Add friends, family, and coworkers with their birth dates, anniversaries, and any special notes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel relative rounded-3xl p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-base shadow-sm">
                2
              </div>
              <h3 className="font-heading mt-6 text-xl font-bold">Customize Alert Timers</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Choose when you want reminder emails delivered to give you enough breathing room for gifts and cards.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel relative rounded-3xl p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-base shadow-sm">
                3
              </div>
              <h3 className="font-heading mt-6 text-xl font-bold">Show Up & Celebrate</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Receive prompt, beautifully formatted email alerts on schedule and be the first to send thoughtful wishes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews / Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Loved by thoughtful people everywhere.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Here is what our users say about staying on top of life&apos;s special moments.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex text-amber-500 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground italic leading-relaxed">
              &ldquo;I used to feel terrible about forgetting nieces&apos; birthdays and close friends&apos; anniversaries. RememberMe has saved me so many awkward moments!&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                AR
              </div>
              <div>
                <p className="text-sm font-semibold">Ananya Roy</p>
                <p className="text-xs text-muted-foreground">Product Designer</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <div className="flex text-amber-500 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground italic leading-relaxed">
              &ldquo;The UI is ultra clean and modern. I love the 3-day advance notice option — gives me time to order flowers before it is too late.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                MR
              </div>
              <div>
                <p className="text-sm font-semibold">Marcus Rivera</p>
                <p className="text-xs text-muted-foreground">Software Engineer</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <div className="flex text-amber-500 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground italic leading-relaxed">
              &ldquo;Pure simplicity without annoying ad bloat or pushy notifications. Just reliable email reminders when I need them most.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                PS
              </div>
              <div>
                <p className="text-sm font-semibold">Priya Sharma</p>
                <p className="text-xs text-muted-foreground">Marketing Lead</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="border-t border-border/70 bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Have questions? We have answers.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass-panel overflow-hidden rounded-2xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-foreground transition hover:text-primary"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="border-t border-border/60 px-5 pb-5 pt-3 text-sm text-muted-foreground leading-relaxed animate-in fade-in-50 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 text-center text-white shadow-2xl sm:p-16">
          <div className="ambient-glow -top-20 -left-20 h-60 w-60 bg-white/20 blur-3xl" />
          
          <h2 className="font-heading relative z-10 text-3xl font-extrabold sm:text-5xl">
            Never miss another moment.
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-xl text-white/90 sm:text-lg">
            Join thousands who stay thoughtfully connected with everyone who matters in their lives.
          </p>

          <div className="relative z-10 mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="flex h-12 items-center gap-2 rounded-2xl bg-white px-8 font-bold text-indigo-600 shadow-lg transition hover:bg-white/95 hover:scale-105 active:scale-95"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/70 py-12 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs text-muted-foreground ml-2">© {new Date().getFullYear()} RememberMe Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition">
              Terms of Service
            </Link>
            <a
              href="https://github.com/Yadavsandeep-stack/remember-me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition"
            >
              GitHub
            </a>
            <Link href="/login" className="hover:text-foreground transition">
              Login
            </Link>
            <Link href="/register" className="hover:text-foreground transition">
              Register
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}