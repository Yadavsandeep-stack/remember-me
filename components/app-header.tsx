"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";

type AppHeaderProps = {
  userEmail?: string;
  userName?: string;
};

export function AppHeader({ userEmail, userName }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 transition-transform active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25 transition-all group-hover:shadow-indigo-500/40">
              <CalendarDays className="h-5 w-5 transition-transform group-hover:scale-110" />
            </div>

            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                Remember<span className="gradient-text">Me</span>
              </span>
              <span className="hidden text-[10px] font-medium text-muted-foreground uppercase tracking-widest sm:block">
                Milestone Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-border/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Add person CTA */}
          <Link
            href="/people/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:opacity-95 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95 sm:h-10 sm:px-4 sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Add person</span>
          </Link>

          {/* Theme switcher */}
          <ThemeToggle />

          {/* Desktop logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log out"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/70 text-muted-foreground backdrop-blur-md transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/70 text-foreground backdrop-blur-md hover:bg-muted"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-border/80 bg-background/95 p-4 backdrop-blur-2xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {userEmail && (
              <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3 px-2 text-xs text-muted-foreground">
                <span className="truncate">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 font-medium text-destructive hover:underline"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
