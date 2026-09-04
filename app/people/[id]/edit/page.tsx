"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Cake,
  Check,
  CircleAlert,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function EditPersonPage() {
  const router = useRouter();
  const params = useParams();

  const personId = params.id as string;

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

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

      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("id", personId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setError("Unable to find this person.");
        setLoading(false);
        return;
      }

      setName(data.name || "");
      setRelationship(data.relationship || "");
      setDob(data.dob || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setNotes(data.notes || "");

      setLoading(false);
    }

    loadPerson();
  }, [personId, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    if (!dob) {
      setError("Please enter a date of birth.");
      return;
    }

    setSaving(true);

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
      .update({
        name: name.trim(),
        relationship: relationship.trim() || null,
        dob,
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", personId)
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Person updated successfully.");

    setTimeout(() => {
      router.push(`/people/${personId}`);
    }, 800);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />

          <div className="mt-8 h-24 animate-pulse rounded-2xl border bg-background" />

          <div className="mt-6 h-[650px] animate-pulse rounded-2xl border bg-background" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push(`/people/${personId}`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {name || "person"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Heading */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Edit person
          </h1>

          <p className="mt-2 text-muted-foreground">
            Update the information you have saved about{" "}
            <span className="font-medium text-foreground">
              {name}
            </span>
            .
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm"
        >
          <div className="space-y-6 p-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Relationship */}
            <div>
              <label
                htmlFor="relationship"
                className="text-sm font-medium"
              >
                Relationship
              </label>

              <input
                id="relationship"
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Friend, Father, Sister, Colleague"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Date of birth */}
            <div>
              <label
                htmlFor="dob"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Cake className="h-4 w-4 text-muted-foreground" />
                Date of birth
              </label>

              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="text-sm font-medium"
              >
                Notes
                <span className="ml-1 font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>

              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add anything useful about this person..."
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {message}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push(`/people/${personId}`)}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-xl border bg-background px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-5 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
          Changes are saved securely to your RememberMe account.
        </div>
      </div>
    </main>
  );
}