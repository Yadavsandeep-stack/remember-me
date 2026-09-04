import React from "react";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
};

export function LogoIcon({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const dimensions = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/25 transition-transform hover:scale-105 select-none ${dimensions} ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f3e8ff" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Calendar Body */}
        <rect
          x="8"
          y="12"
          width="32"
          height="28"
          rx="7"
          fill="url(#logo-grad)"
          fillOpacity="0.18"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Calendar Top Header Line */}
        <line
          x1="8"
          y1="20"
          x2="40"
          y2="20"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.8"
        />

        {/* Calendar Rings / Pins */}
        <rect x="14" y="8" width="3" height="6" rx="1.5" fill="#ffffff" />
        <rect x="31" y="8" width="3" height="6" rx="1.5" fill="#ffffff" />

        {/* Central Heart / Infinity Ribbon Knot */}
        <path
          d="M24 25C21 21.5 16 23 16 27C16 31 24 35 24 35C24 35 32 31 32 27C32 23 27 21.5 24 25Z"
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Dynamic Sparkle in Top-Right Corner */}
        <path
          d="M38 6L39.2 9.8L43 11L39.2 12.2L38 16L36.8 12.2L33 11L36.8 9.8L38 6Z"
          fill="#ffd700"
          filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))"
        />
      </svg>
    </div>
  );
}

export function Logo({ size = "md", iconOnly = false, className = "" }: LogoProps) {
  const textSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />

      {!iconOnly && (
        <span className={`font-heading font-extrabold tracking-tight text-foreground ${textSizes}`}>
          Remember<span className="gradient-text">Me</span>
        </span>
      )}
    </div>
  );
}
