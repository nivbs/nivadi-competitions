import { Checker } from "@/components/board/Checker";
import { playerTone } from "@/lib/player-style";
import { selectPlayerFormAction } from "@/actions/auth";
import { getDict } from "@/lib/i18n/server";
import type { PlayerSlug } from "@/lib/session/types";

const slugs: PlayerSlug[] = ["niv", "gilad"];

export async function PlayerPicker() {
  const { t } = await getDict();
  const players = slugs.map((slug) => ({
    slug,
    label: t.players[slug],
    hint: t.playerHints[slug],
  }));
  return (
    <div className="grid gap-3">
      {players.map((player) => (
        <form key={player.slug} action={selectPlayerFormAction}>
          <input type="hidden" name="slug" value={player.slug} />
          <button
            type="submit"
            className={`flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] px-4 py-4 text-start shadow-[var(--shadow-soft)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] ${playerTone(player.slug)}`}
          >
            <Checker player={player.slug} size={36} aria-hidden />
            <span className="flex-1 font-display text-2xl font-bold">
              {player.label}
            </span>
            <span className="text-sm opacity-80" dir="ltr">
              {player.hint}
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}
