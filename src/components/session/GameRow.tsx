"use client";

import { IconButton } from "@/components/ui/IconButton";
import { WinTypeSelect, WinnerSelect } from "@/components/ui/Segmented";
import { TrashIcon } from "@/components/ui/icons";
import { formatClock } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import type { PlayerSlug, WinType } from "@/lib/scoring";

export type EditableGame = {
  winner: PlayerSlug;
  winType: WinType;
  nivTimeUsedSec?: number | null;
  giladTimeUsedSec?: number | null;
};

/** One editable game: winner, win type, delete. Shared by the log builder and the session editor. */
export function GameRow({
  index,
  game,
  busy,
  onChange,
  onRemove,
}: {
  index: number;
  game: EditableGame;
  busy?: boolean;
  onChange: (next: EditableGame) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const hasTime = game.nivTimeUsedSec != null || game.giladTimeUsedSec != null;
  return (
    <li className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">{t.gameRow.game(index + 1)}</span>
        <IconButton label={t.gameRow.deleteGame(index + 1)} tone="danger" disabled={busy} onClick={onRemove}>
          <TrashIcon width={20} height={20} />
        </IconButton>
      </div>
      <div className="mt-2 space-y-2">
        <WinnerSelect value={game.winner} onChange={(winner) => onChange({ ...game, winner })} />
        <WinTypeSelect value={game.winType} onChange={(winType) => onChange({ ...game, winType })} />
      </div>
      {hasTime ? (
        <p className="mt-2 text-xs tabular-nums text-[var(--color-ink-muted)]" dir="ltr">
          {t.gameRow.time(formatClock(game.nivTimeUsedSec ?? 0), formatClock(game.giladTimeUsedSec ?? 0), t.players.niv, t.players.gilad)}
        </p>
      ) : null}
    </li>
  );
}
