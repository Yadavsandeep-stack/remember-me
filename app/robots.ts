import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/login", "/register", "/forgot-password"],
        disallow: ["/dashboard", "/people", "/calendar", "/settings", "/api/"],
      },
    ],
    sitemap: "https://rememberme.app/sitemap.xml",
  };
}
