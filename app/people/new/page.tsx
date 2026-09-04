"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Plus,
  Save,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";

const relationships = ["Family", "Friend", "Partner", "Colleague", "Other"];

export default function NewPersonPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Friend");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter a name.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to add a person.");
      setLoading(false);
      return;
    }

    const { data: newPerson, error: insertError } = await supabase
      .from("people")
      .insert({
        user_id: user.id,
        name: name.trim(),
        dob: dob || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        relationship: relationship || null,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess("Person added successfully!");

    setTimeout(() => {
      if (newPerson?.id) {
        router.push(`/people/${newPerson.id}`);
      } else {
        router.push("/dashboard");
      }
    }, 800);
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <User className="h-6 w-6" />
          </div>

          <h1 className="font-heading mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Add a new person
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Save someone special and keep track of their birthday and milestones.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel overflow-hidden rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Maya Lin, Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Relationship Pill Selector */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Relationship
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {relationships.map((rel) => {
                const isSelected = relationship === rel;
                return (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelationship(rel)}
                    className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                        : "border border-border/70 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date of Birth Field */}
          <div>
            <label
              htmlFor="dob"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Used to calculate upcoming birthdays and milestones.
            </p>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="maya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-500" />
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
              />
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label
              htmlFor="notes"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              Personal Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Gift ideas, favorite colors, how you met..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full resize-none rounded-2xl border border-border/70 bg-card/80 p-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving person..." : "Save Person"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
