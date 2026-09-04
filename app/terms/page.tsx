import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of RememberMe.",
};

export default function TermsPage() {
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
            <FileText className="h-4 w-4" /> Legal & Terms
          </div>

          <h1 className="font-heading mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Last Updated: September 4, 2026 • Effective Immediately
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground shadow-xl">
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using RememberMe (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use or access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              2. User Accounts & Security
            </h2>
            <p>
              When creating an account, you must provide accurate, complete information. You are responsible for safeguarding your login credentials and password, and for all activities occurring under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              3. Acceptable Use
            </h2>
            <p>
              You agree to use RememberMe solely for legitimate milestone, birthday, and contact management purposes. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Attempt to disrupt or compromise the security or integrity of our systems.</li>
              <li>Use the Service to transmit spam, unsolicited bulk messages, or malicious content.</li>
              <li>Reverse engineer, scrape, or extract unauthorized data from the application.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              4. Service Availability & Email Notifications
            </h2>
            <p>
              While we strive for 99.9% uptime and reliable reminder dispatches, email deliverability depends on external internet routing and recipient email provider policies. We cannot guarantee that third-party mailbox providers will never filter alerts into spam folders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              5. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p>
              The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind. Under no circumstances shall RememberMe, its developers, or contributors be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              6. Modifications to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service following any updates constitutes acceptance of the revised terms.
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
