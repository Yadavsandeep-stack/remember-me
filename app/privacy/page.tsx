import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how RememberMe safeguards your personal milestone and contacts data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-xl border border-border/70 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Privacy & Data Governance
          </div>

          <h1 className="font-heading mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Last Updated: September 4, 2026 • Effective Immediately
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground shadow-xl">
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              1. Our Commitment to Your Privacy
            </h2>
            <p>
              At RememberMe, we believe personal relationships, birthdays, and anniversaries are inherently private. We are committed to transparency, data minimization, and industry-standard security. We do not sell, rent, or trade your contacts, birthdays, or notes to any third party or advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Account Information:</strong> When you register, we collect your email address and optional display name to authenticate your account and route your milestone notifications.
              </li>
              <li>
                <strong className="text-foreground">Personal Milestone Records:</strong> Information you explicitly enter about people in your circle, including names, dates of birth, custom event dates (e.g. anniversaries), relationship tags, phone numbers, and optional personal notes.
              </li>
              <li>
                <strong className="text-foreground">Reminder Preferences:</strong> Configuration data determining when and how you receive alerts (e.g., notification intervals such as 1 day or 3 days in advance).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              3. How We Use Your Data
            </h2>
            <p>
              Your information is strictly utilized to provide the core services of RememberMe:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Calculating upcoming dates, ages, and milestone countdowns.</li>
              <li>Dispatching automated email notifications at your requested advance intervals.</li>
              <li>Allowing you to manage, edit, sort, and export your personal milestone directory.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              4. Data Storage & Security
            </h2>
            <p>
              All personal records are stored in PostgreSQL databases protected by strict <strong className="text-foreground">Row-Level Security (RLS)</strong>. Only your authenticated user credentials have read and write permissions to your records. All web traffic and API communications are encrypted using Transport Layer Security (TLS 1.3).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              5. Third-Party Service Providers
            </h2>
            <p>
              We partner with trusted enterprise infrastructure providers to deliver our services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Supabase:</strong> For authentication and encrypted database hosting.
              </li>
              <li>
                <strong className="text-foreground">Email Delivery Services (Resend / Brevo):</strong> To deliver transactional emails and scheduled reminder alerts to your inbox.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              6. Your Rights & Data Portability
            </h2>
            <p>
              You maintain complete ownership of your data at all times:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Export:</strong> You can download a complete JSON backup of all your people, events, and reminders in Settings with a single click.
              </li>
              <li>
                <strong className="text-foreground">Deletion:</strong> You can delete individual people, events, or your entire account at any time. Deleted records are purged permanently.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              7. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out via our GitHub repository or contact our support team.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} RememberMe. All rights reserved.</p>
      </footer>
    </div>
  );
}
