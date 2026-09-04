"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Save,
  Tag,
  Trash2,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";

const relationships = ["Family", "Friend", "Partner", "Colleague", "Other"];

export default function EditPersonPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Friend");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
      setRelationship(data.relationship || "Friend");
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

    setSaving(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("people")
      .update({
        name: name.trim(),
        relationship: relationship || null,
        dob: dob || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", personId)
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Profile updated successfully.");
    setSaving(false);

    setTimeout(() => {
      router.push(`/people/${personId}`);
    }, 600);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="h-96 animate-pulse rounded-3xl border border-border/60 bg-card/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href={`/people/${personId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            Edit {name}&apos;s details
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Update personal contact info, relationship tag, and birth date.
          </p>
        </div>

        {/* Form */}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/80 px-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              Notes & Preferences
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full resize-none rounded-2xl border border-border/70 bg-card/80 p-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
            />
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving changes..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-6 font-semibold text-destructive transition hover:bg-destructive/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </form>
      </main>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel max-w-md rounded-3xl p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="font-heading mt-4 text-xl font-bold">
              Delete {name}?
            </h3>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This will permanently delete this person and all their tracked dates. This action cannot be undone.
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