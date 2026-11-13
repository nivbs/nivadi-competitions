import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, IBM_Plex_Sans, IBM_Plex_Sans_Hebrew, IBM_Plex_Mono } from "next/font/google";

import { FxProvider } from "@/components/motion/FxProvider";
import { I18nProvider } from "@/lib/i18n/client";
import { dirFor } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/server";

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

const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-display",
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

// The locale comes from a cookie, so the root shell is rendered per request.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.meta.title, description: t.meta.description };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2F1A0E",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getDict();
  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${plexSansLatin.variable} ${plexSansHebrew.variable} ${plexMono.variable} ${frankRuhl.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--color-walnut-deep)] font-sans text-[var(--color-ink)] antialiased">
        <I18nProvider locale={locale}>
          <FxProvider>{children}</FxProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
