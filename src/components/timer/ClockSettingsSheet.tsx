"use client";

import { PlayerMark } from "@/components/board/PlayerMark";
import { BottomSheet } from "@/components/ui/BottomSheet";
import type { ClockSettings, ClockState } from "@/lib/clock/engine";
import { formatMs } from "@/lib/clock/engine";
import { useI18n } from "@/lib/i18n/client";
import { PLAYER_SLUGS, type PlayerSlug } from "@/lib/scoring";

const PRESETS: { label: string; settings: ClockSettings }[] = [
  { label: "6:00 + 12", settings: { bankSec: { niv: 360, gilad: 360 }, delaySec: 12 } },
  { label: "4:00 + 10", settings: { bankSec: { niv: 240, gilad: 240 }, delaySec: 10 } },
  { label: "3:00 + 8", settings: { bankSec: { niv: 180, gilad: 180 }, delaySec: 8 } },
  { label: "10:00 + 12", settings: { bankSec: { niv: 600, gilad: 600 }, delaySec: 12 } },
];

const btn =
  "h-11 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 text-sm font-semibold tabular-nums text-[var(--color-ink)] hover:border-[var(--color-brand)]";

type Props = {
  open: boolean;
  clock: ClockState;
  onClose: () => void;
  onSettings: (s: ClockSettings) => void;
  onAdjust: (p: PlayerSlug, deltaSec: number) => void;
};

export function ClockSettingsSheet({ open, clock, onClose, onSettings, onAdjust }: Props) {
  const { t } = useI18n();
  const { settings } = clock;
  const setBank = (p: PlayerSlug, delta: number) =>
    onSettings({
      ...settings,
      bankSec: { ...settings.bankSec, [p]: Math.max(30, settings.bankSec[p] + delta) },
    });

  return (
    <BottomSheet open={open} title={t.timer.settings} onClose={onClose}>
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t.clockSettings.addTime}</h3>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{t.clockSettings.addTimeHint}</p>
          <div className="mt-3 space-y-3">
            {PLAYER_SLUGS.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <PlayerMark player={p} label={t.players[p]} size={16} className="w-20 shrink-0 text-sm font-medium" />
                <span className="w-14 text-center font-mono tabular-nums" dir="ltr">
                  {formatMs(clock.bankMs[p])}
                </span>
                <div className="flex flex-1 justify-end gap-1" dir="ltr">
                  {[-60, -30, 30, 60].map((d) => (
                    <button key={d} type="button" className={btn} onClick={() => onAdjust(p, d)}>
                      {d > 0 ? "+" : "−"}
                      {Math.abs(d)}s
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t.clockSettings.presets}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className={btn} dir="ltr" onClick={() => onSettings(p.settings)}>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t.clockSettings.bankDelay}</h3>
          <div className="mt-3 space-y-3">
            {PLAYER_SLUGS.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <PlayerMark player={p} label={t.players[p]} size={16} className="w-20 shrink-0 text-sm font-medium" />
                <div className="flex flex-1 items-center justify-end gap-2" dir="ltr">
                  <button type="button" className={btn} onClick={() => setBank(p, -30)}>−30s</button>
                  <span className="w-14 text-center font-mono tabular-nums">{formatMs(settings.bankSec[p] * 1000)}</span>
                  <button type="button" className={btn} onClick={() => setBank(p, 30)}>+30s</button>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-12 text-sm font-medium">{t.clockSettings.delay}</span>
              <div className="flex flex-1 items-center justify-end gap-2" dir="ltr">
                <button type="button" className={btn} onClick={() => onSettings({ ...settings, delaySec: Math.max(0, settings.delaySec - 1) })}>−1s</button>
                <span className="w-14 text-center font-mono tabular-nums">{settings.delaySec}s</span>
                <button type="button" className={btn} onClick={() => onSettings({ ...settings, delaySec: Math.min(60, settings.delaySec + 1) })}>+1s</button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
            {t.clockSettings.note}
          </p>
        </section>

        <button
          type="button"
          onClick={onClose}
          className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-brand)] font-semibold text-white"
        >
          {t.common.close}
        </button>
      </div>
    </BottomSheet>
  );
}
