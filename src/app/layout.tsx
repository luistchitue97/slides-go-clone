import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DeckForge — Business presentation templates that don't look templated",
    template: "%s · DeckForge",
  },
  description:
    "A curated library of premium business presentation templates — pitches, QBRs, sales playbooks, finance reports — ready to launch.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    type: "website",
    title: "DeckForge",
    description:
      "A curated library of premium business presentation templates — pitches, QBRs, sales playbooks, finance reports — ready to launch.",
    siteName: "DeckForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeckForge",
    description:
      "A curated library of premium business presentation templates — pitches, QBRs, sales playbooks, finance reports — ready to launch.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
