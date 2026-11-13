import type { DatabaseSetupNoticeProps } from "@/components/shell/types";
import { getDict } from "@/lib/i18n/server";

export async function DatabaseSetupNotice({ reason }: DatabaseSetupNoticeProps) {
  const { t } = await getDict();
  const content = t.db[reason];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <h1 className="text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">
          {content.title}
        </h1>
        <p className="mt-2 max-w-prose text-[var(--color-ink-muted)]">{content.body}</p>
        {content.steps.length > 0 ? (
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[var(--color-ink)]" dir="ltr">
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
