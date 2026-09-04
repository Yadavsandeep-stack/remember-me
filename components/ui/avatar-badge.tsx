import React from "react";

type AvatarBadgeProps = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const gradients = [
  "from-indigo-500 to-purple-600 text-white",
  "from-blue-500 to-cyan-500 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-violet-600 to-fuchsia-600 text-white",
  "from-cyan-500 to-blue-600 text-white",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarBadge({ name, size = "md", className = "" }: AvatarBadgeProps) {
  const gradient = getGradient(name || "");
  const initials = getInitials(name || "");

  const sizeClasses = {
    sm: "h-8 w-8 text-xs font-semibold shadow-xs",
    md: "h-11 w-11 text-sm font-semibold shadow-sm",
    lg: "h-14 w-14 text-base font-bold shadow-md",
    xl: "h-20 w-20 text-2xl font-extrabold shadow-lg",
  }[size];

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} ${sizeClasses} ring-2 ring-background/50 transition-transform select-none ${className}`}
    >
      <span className="tracking-wider">{initials}</span>
    </div>
  );
}
