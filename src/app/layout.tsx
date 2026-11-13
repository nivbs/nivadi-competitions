import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Rubik, Suez_One } from "next/font/google";

import { FxProvider } from "@/components/motion/FxProvider";
import { I18nProvider } from "@/lib/i18n/client";
import { dirFor } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/server";

import "./globals.css";

const rubik = Rubik({
  variable: "--font-sans-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const suezOne = Suez_One({
  variable: "--font-display",
  subsets: ["hebrew", "latin"],
  weight: "400",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
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
      className={`${rubik.variable} ${suezOne.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--color-walnut-deep)] font-sans text-[var(--color-ink)] antialiased">
        <I18nProvider locale={locale}>
          <FxProvider>{children}</FxProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
