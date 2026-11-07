import { selectPlayerFormAction } from "@/actions/auth";
import type { PlayerSlug } from "@/lib/session/types";

const players: { slug: PlayerSlug; label: string; hint: string }[] = [
  { slug: "niv", label: "ניב", hint: "Nivi" },
  { slug: "gilad", label: "גלעד", hint: "Giladi" },
];

export function PlayerPicker() {
  return (
    <div className="grid gap-3">
      {players.map((player) => (
        <form key={player.slug} action={selectPlayerFormAction}>
          <input type="hidden" name="slug" value={player.slug} />
          <button
            type="submit"
            className="flex w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-4 text-start transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
          >
            <span className="text-lg font-semibold text-[var(--color-ink)]">
              {player.label}
            </span>
            <span className="text-sm text-[var(--color-accent-muted)]" dir="ltr">
              {player.hint}
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}
