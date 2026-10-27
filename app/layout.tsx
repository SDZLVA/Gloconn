import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { getAppConfig } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Glooconn";
const SITE_TAGLINE = "Search flights and hotels. Get the best package.";
const SITE_DESCRIPTION =
  "Tell Glooconn where you want to go and what you can spend. It searches flights and hotels, builds complete trip packages, and shows cheaper dates when your budget does not fit.";

/**
 * Site-wide metadata. `metadataBase` lets Next build absolute URLs for
 * social previews; pages override `title` and `description` as needed.
 */
export const metadata: Metadata = {
  metadataBase: new URL(getAppConfig().app.siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

/**
 * Root layout must be dynamically rendered so Next.js can stamp the
 * per-request CSP nonce onto framework scripts (Next.js 16.3 CSP guide).
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
