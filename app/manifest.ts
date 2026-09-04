import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RememberMe — Personal Milestone & Date Manager",
    short_name: "RememberMe",
    description: "Keep track of birthdays, anniversaries, and milestones with automated smart reminders.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
