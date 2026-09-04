"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewPersonPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    // Get currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to add a person.");
      setLoading(false);
      return;
    }

    // Insert person into database
    const { error: insertError } = await supabase
      .from("people")
      .insert({
        user_id: user.id,
        name: name,
        dob: dob || null,
        email: email || null,
        phone: phone || null,
        relationship: relationship || null,
        notes: notes || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess("Person added successfully!");

    setLoading(false);

    // Go back to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  }

  return (
    <main className="min-h-screen px-6 py-10">

      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">

          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to dashboard
          </Link>

          <h1 className="mt-6 text-3xl font-bold">
            Add a person
          </h1>

          <p className="mt-2 text-muted-foreground">
            Save someone's important details and birthday.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border p-6"
        >

          {/* Name */}
          <div className="space-y-2">

            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Name *
            </label>

            <input
              id="name"
              type="text"
              placeholder="Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />

          </div>

          {/* Date of Birth */}
          <div className="space-y-2">

            <label
              htmlFor="dob"
              className="text-sm font-medium"
            >
              Date of birth
            </label>

            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />

            <p className="text-xs text-muted-foreground">
              We'll use this to calculate their upcoming birthday.
            </p>

          </div>

          {/* Relationship */}
          <div className="space-y-2">

            <label
              htmlFor="relationship"
              className="text-sm font-medium"
            >
              Relationship
            </label>

            <select
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            >

              <option value="">
                Select relationship
              </option>

              <option value="Family">
                Family
              </option>

              <option value="Friend">
                Friend
              </option>

              <option value="Partner">
                Partner
              </option>

              <option value="Colleague">
                Colleague
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* Email */}
          <div className="space-y-2">

            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />

          </div>

          {/* Phone */}
          <div className="space-y-2">

            <label
              htmlFor="phone"
              className="text-sm font-medium"
            >
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />

          </div>

          {/* Notes */}
          <div className="space-y-2">

            <label
              htmlFor="notes"
              className="text-sm font-medium"
            >
              Notes
            </label>

            <textarea
              id="notes"
              placeholder="Anything you want to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add person"}
          </button>

        </form>

      </div>

    </main>
  );
}