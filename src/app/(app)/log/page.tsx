import Link from "next/link";

import { SessionBuilder } from "@/components/session/SessionBuilder";
import { getDict } from "@/lib/i18n/server";

export default async function LogPage() {
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
        {t.nav.log}
      </h1>
      <p className="mt-2 max-w-prose text-[var(--color-ink-muted)]">
        {t.log.intro1}{" "}
        <Link href="/timer" className="font-medium text-[var(--color-brand)] underline sm:hidden">
          {t.log.introLink}
        </Link>
        <span className="hidden sm:inline">{t.log.introLink}</span>{" "}
        {t.log.intro2}
      </p>
      <div className="mt-8">
        <SessionBuilder />
      </div>
    </div>
  );
}
