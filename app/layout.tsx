import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RememberMe — Never forget an important date",
    template: "%s | RememberMe",
  },
  description: "Keep the people and dates that matter organized, private, and on time.",
  applicationName: "RememberMe",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "RememberMe",
    description: "Never forget an important date again.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
