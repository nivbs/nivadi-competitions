import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Hebrew, IBM_Plex_Mono } from "next/font/google";

import "./globals.css";

const plexSansLatin = IBM_Plex_Sans({
  variable: "--font-sans-latin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexSansHebrew = IBM_Plex_Sans_Hebrew({
  variable: "--font-sans-hebrew",
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ניב מול גלעד · שש בש",
  description: "רישום תוצאות שש בש, שעון 6 דקות לכל שחקן וניתוח לאורך זמן.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F0E8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${plexSansLatin.variable} ${plexSansHebrew.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--color-canvas)] font-sans text-[var(--color-ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
