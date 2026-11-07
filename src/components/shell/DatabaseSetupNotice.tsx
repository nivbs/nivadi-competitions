import type { DatabaseSetupNoticeProps } from "@/components/shell/types";

const copy: Record<
  DatabaseSetupNoticeProps["reason"],
  { title: string; body: string; steps?: string[] }
> = {
  no_database_url: {
    title: "מסד נתונים לא מחובר",
    body: "הגדירו את משתנה הסביבה DATABASE_URL (מחרוזת החיבור מ-Neon) ב-Vercel או ב-.env.local.",
  },
  schema_missing: {
    title: "הטבלאות עדיין לא נוצרו ב-Neon",
    body: "החיבור ל-Neon עובד, אבל הסכמה לא הוחלה. זה מה שקורה אחרי פריסה ראשונה — לא תקלה בכניסה.",
    steps: [
      "מקומית: npm run db:push ואז npm run db:seed",
      "ב-Vercel: הריצו את אותן פקודות מול מסד הייצור (או העתיקו את SQL מ-drizzle/)",
    ],
  },
  not_seeded: {
    title: "נתוני התחלה חסרים",
    body: "הסכמה קיימת, אבל עדיין אין שחקנים או תחרות פעילה.",
    steps: ["הריצו: npm run db:seed"],
  },
};

export function DatabaseSetupNotice({ reason }: DatabaseSetupNoticeProps) {
  const content = copy[reason];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <h1 className="text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">
          {content.title}
        </h1>
        <p className="mt-2 max-w-prose text-[var(--color-ink-muted)]">{content.body}</p>
        {content.steps ? (
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[var(--color-ink)]">
            {content.steps.map((step) => (
              <li key={step}>
                <code className="font-mono text-[0.9em]">{step}</code>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
