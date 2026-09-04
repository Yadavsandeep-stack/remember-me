"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Person = {
    id: string;
    name: string;
    dob: string | null;
    email: string | null;
    phone: string | null;
    relationship: string | null;
    notes: string | null;
};

export default function DashboardPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            const supabase = createClient();

            // Get logged-in user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            setEmail(user.email ?? "");

            // Get user's people
            const { data, error } = await supabase
                .from("people")
                .select("*")
                .eq("user_id", user.id)
                .order("name", { ascending: true });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setPeople(data ?? []);
            setLoading(false);
        }

        loadDashboard();
    }, [router]);

    async function handleLogout() {
        const supabase = createClient();

        await supabase.auth.signOut();

        router.push("/login");
    }
    async function sendTestEmail() {
  const response = await fetch("/api/send-test-email", {
    method: "POST",
  });

  const result = await response.json();

  if (result.success) {
    alert("Test email sent! 📧");
  } else {
    alert(result.error || "Failed to send email");
  }
}

    function getNextBirthday(dob: string) {
        const today = new Date();

        const birthDate = new Date(`${dob}T00:00:00`);

        let birthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If birthday has already passed this year,
        // use next year.
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

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );
    }

    function formatBirthday(dob: string) {
        const date = new Date(`${dob}T00:00:00`);

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
        });
    }

    const upcomingPeople = people
        .filter((person) => person.dob)
        .sort((a, b) => {
            return (
                getNextBirthday(a.dob!).getTime() -
                getNextBirthday(b.dob!).getTime()
            );
        })
        .slice(0, 5);

    return (
        <main className="min-h-screen px-6 py-10">

            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <header className="flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold">
                            RememberMe
                        </h1>

                        <p className="mt-1 text-muted-foreground">
                            Welcome back{email ? `, ${email}` : ""}.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        Log out
                    </button>

                </header>

                {/* Add person */}
                <div className="mt-8 flex items-center justify-between">

                    <div>
                        <h2 className="text-2xl font-semibold">
                            Your important dates
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Never miss a birthday or important event.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/people/new")}
                        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
                    >
                        + Add Person
                    </button>
<button
  onClick={sendTestEmail}
  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
>
  📧 Send Test Email
</button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="mt-12 text-center text-muted-foreground">
                        Loading your dates...
                    </div>
                )}

                {/* Upcoming birthdays */}
                {!loading && upcomingPeople.length > 0 && (
                    <section className="mt-10">

                        <h3 className="mb-4 text-lg font-semibold">
                            Upcoming birthdays 🎂
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">

                            {upcomingPeople.map((person) => {

                                const days = getDaysUntilBirthday(
                                    person.dob!
                                );

                                return (
                                    <div
                                        key={person.id}
                                        onClick={() =>
                                            router.push(`/people/${person.id}/reminder`)
                                        }
                                        className="cursor-pointer rounded-xl border p-5 transition hover:shadow-sm"
                                    >

                                        <div className="flex items-start justify-between">

                                            <div>
                                                <h4 className="text-lg font-semibold">
                                                    {person.name}
                                                </h4>

                                                {person.relationship && (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {person.relationship}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-2xl">
                                                🎂
                                            </div>

                                        </div>

                                        <div className="mt-5">

                                            <p className="font-medium">
                                                {formatBirthday(person.dob!)}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {days === 0
                                                    ? "Today 🎉"
                                                    : days === 1
                                                        ? "Tomorrow"
                                                        : `In ${days} days`}
                                            </p>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    </section>
                )}

                {/* No birthdays */}
                {!loading &&
                    people.length > 0 &&
                    upcomingPeople.length === 0 && (
                        <div className="mt-10 rounded-xl border p-10 text-center">
                            <div className="text-4xl">
                                🎂
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                No birthdays yet
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Add a date of birth to start tracking birthdays.
                            </p>
                        </div>
                    )}

                {/* No people */}
                {!loading && people.length === 0 && (
                    <div className="mt-10 rounded-xl border p-10 text-center">

                        <div className="text-4xl">
                            🗓️
                        </div>

                        <h3 className="mt-4 text-xl font-semibold">
                            Your calendar is empty
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                            Add birthdays and important dates so RememberMe
                            can help you stay on top of them.
                        </p>

                        <button
                            onClick={() => router.push("/people/new")}
                            className="mt-6 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground"
                        >
                            Add your first person
                        </button>

                    </div>
                )}

                {/* All people */}
                {!loading && people.length > 0 && (
                    <section className="mt-12">

                        <h3 className="mb-4 text-lg font-semibold">
                            All people
                        </h3>

                        <div className="overflow-hidden rounded-xl border">

                            {people.map((person) => (
                                <div
                                    key={person.id}
                                    className="flex items-center justify-between border-b p-4 last:border-b-0"
                                >

                                    <div>
                                        <p className="font-medium">
                                            {person.name}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {person.relationship || "Person"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">

                                        {person.dob && (
                                            <p className="text-sm text-muted-foreground">
                                                🎂 {formatBirthday(person.dob)}
                                            </p>
                                        )}

                                        <button
                                            onClick={() =>
                                                router.push(`/people/${person.id}/reminder`)
                                            }
                                            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                                        >
                                            🔔 Reminder
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>

                    </section>
                )}

            </div>

        </main>
    );
}