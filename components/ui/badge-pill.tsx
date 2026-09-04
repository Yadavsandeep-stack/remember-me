import React from "react";

type BadgePillProps = {
  label: string;
  variant?: "relationship" | "event" | "status" | "default";
  size?: "sm" | "md";
  className?: string;
};

const relationshipStyles: Record<string, { bg: string; text: string; border: string }> = {
  Family: {
    bg: "bg-blue-500/10 dark:bg-blue-400/15",
    text: "text-blue-600 dark:text-blue-300",
    border: "border-blue-500/20 dark:border-blue-400/25",
  },
  Friend: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/15",
    text: "text-emerald-600 dark:text-emerald-300",
    border: "border-emerald-500/20 dark:border-emerald-400/25",
  },
  Partner: {
    bg: "bg-rose-500/10 dark:bg-rose-400/15",
    text: "text-rose-600 dark:text-rose-300",
    border: "border-rose-500/20 dark:border-rose-400/25",
  },
  Colleague: {
    bg: "bg-purple-500/10 dark:bg-purple-400/15",
    text: "text-purple-600 dark:text-purple-300",
    border: "border-purple-500/20 dark:border-purple-400/25",
  },
  Other: {
    bg: "bg-slate-500/10 dark:bg-slate-400/15",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-500/20 dark:border-slate-400/25",
  },
};

const eventStyles: Record<string, { bg: string; text: string; border: string; icon?: string }> = {
  Birthday: {
    bg: "bg-amber-500/10 dark:bg-amber-400/15",
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-500/25 dark:border-amber-400/30",
  },
  Anniversary: {
    bg: "bg-rose-500/10 dark:bg-rose-400/15",
    text: "text-rose-600 dark:text-rose-300",
    border: "border-rose-500/25 dark:border-rose-400/30",
  },
  Graduation: {
    bg: "bg-indigo-500/10 dark:bg-indigo-400/15",
    text: "text-indigo-600 dark:text-indigo-300",
    border: "border-indigo-500/25 dark:border-indigo-400/30",
  },
  "Work Anniversary": {
    bg: "bg-teal-500/10 dark:bg-teal-400/15",
    text: "text-teal-600 dark:text-teal-300",
    border: "border-teal-500/25 dark:border-teal-400/30",
  },
  Relationship: {
    bg: "bg-pink-500/10 dark:bg-pink-400/15",
    text: "text-pink-600 dark:text-pink-300",
    border: "border-pink-500/25 dark:border-pink-400/30",
  },
  Custom: {
    bg: "bg-violet-500/10 dark:bg-violet-400/15",
    text: "text-violet-600 dark:text-violet-300",
    border: "border-violet-500/25 dark:border-violet-400/30",
  },
};

export function BadgePill({
  label,
  variant = "default",
  size = "sm",
  className = "",
}: BadgePillProps) {
  let style = {
    bg: "bg-muted/80",
    text: "text-muted-foreground",
    border: "border-border/60",
  };

  if (variant === "relationship" && relationshipStyles[label]) {
    style = relationshipStyles[label];
  } else if (variant === "event" && eventStyles[label]) {
    style = eventStyles[label];
  }

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-0.5 text-xs font-medium"
      : "px-3 py-1 text-sm font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} backdrop-blur-sm transition-all ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
