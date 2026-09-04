"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReminderPage() {
  const router = useRouter();
  const params = useParams();

  const personId = params.id as string;

  const [daysBefore, setDaysBefore] = useState("1");
  const [emailReminder, setEmailReminder] = useState(true);

  const [reminderId, setReminderId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReminder() {
      const supabase = createClient();

      // Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Find existing reminder
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("person_id", personId)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // If reminder already exists, load its settings
      if (data) {
        setReminderId(data.id);
        setDaysBefore(String(data.days_before));
        setEmailReminder(data.send_email);
      }

      setLoading(false);
    }

    loadReminder();
  }, [personId, router]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // If reminder already exists → UPDATE
    if (reminderId) {
      const { error } = await supabase
        .from("reminders")
        .update({
          days_before: Number(daysBefore),
          send_email: emailReminder,
          enabled: true,
        })
        .eq("id", reminderId)
        .eq("user_id", user.id);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setMessage("Reminder updated successfully! 🔔");
    }

    // If reminder doesn't exist → INSERT
    else {
      const { data, error } = await supabase
        .from("reminders")
        .insert({
          user_id: user.id,
          person_id: personId,
          days_before: Number(daysBefore),
          send_email: emailReminder,
          send_push: false,
          enabled: true,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setReminderId(data.id);

      setMessage("Reminder saved successfully! 🔔");
    }

    setSaving(false);

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-xl text-center">
          Loading reminder settings...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-xl">

        <button
          onClick={() => router.push("/dashboard")}
          className="mb-5 text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </button>

        <h1 className="text-3xl font-bold">
          Reminder Settings 🔔
        </h1>

        <p className="mt-2 text-muted-foreground">
          Choose when you want to be reminded about this birthday.
        </p>

        <div className="mt-8 rounded-xl border p-6 shadow-sm">

          {/* Days Before */}
          <div>
            <label className="text-sm font-medium">
              Remind me
            </label>

            <select
              value={daysBefore}
              onChange={(e) => setDaysBefore(e.target.value)}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="0">
                On the birthday
              </option>

              <option value="1">
                1 day before
              </option>

              <option value="2">
                2 days before
              </option>

              <option value="3">
                3 days before
              </option>

              <option value="7">
                7 days before
              </option>

              <option value="14">
                14 days before
              </option>

              <option value="30">
                30 days before
              </option>
            </select>
          </div>

          {/* Email */}
          <div className="mt-6 flex items-center justify-between rounded-lg border p-4">

            <div>
              <p className="font-medium">
                Email reminder
              </p>

              <p className="text-sm text-muted-foreground">
                Receive a reminder in your email.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEmailReminder(!emailReminder)
              }
              className={`relative h-6 w-11 rounded-full transition ${
                emailReminder
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  emailReminder
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>

          {/* Success */}
          {message && (
            <div className="mt-5 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Reminder"}
          </button>

        </div>
      </div>
    </main>
  );
}