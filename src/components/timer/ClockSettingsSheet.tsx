"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { PlayerMark } from "@/components/board/PlayerMark";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ChevronDownIcon } from "@/components/ui/icons";
import { LoopWheel } from "@/components/ui/LoopWheel";
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

const MAX_BANK_SEC = 15 * 60;
const CORRECTION_DELTAS = [-30, -15, 15, 30, 60] as const;

const stepBtn =
  "flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] text-xl font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)]";

const presetBtn =
  "h-11 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 text-sm font-semibold tabular-nums text-[var(--color-ink)] hover:border-[var(--color-brand)]";

const correctionBtn =
  "h-10 min-w-[3.25rem] rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-2 text-sm font-semibold tabular-nums text-[var(--color-ink)] hover:border-[var(--color-brand)]";

function bankParts(totalSec: number) {
  const total = Math.min(MAX_BANK_SEC, Math.max(0, totalSec));
  return { min: Math.floor(total / 60), sec: total % 60 };
}

function gameTimeDirty(
  saved: Record<PlayerSlug, number>,
  draft: Record<PlayerSlug, number>,
) {
  return PLAYER_SLUGS.some((p) => saved[p] !== draft[p]);
}

/** Snapshot when the sheet opens: configured total before play, remaining time mid-game. */
function gameTimeBaseline(clock: ClockState): Record<PlayerSlug, number> {
  if (clock.status === "idle") return { ...clock.settings.bankSec };
  return Object.fromEntries(
    PLAYER_SLUGS.map((p) => [p, Math.ceil(clock.bankMs[p] / 1000)]),
  ) as Record<PlayerSlug, number>;
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-3 text-start"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="text-sm font-semibold text-[var(--color-ink)]">{title}</span>
        <ChevronDownIcon
          width={20}
          height={20}
          className={`shrink-0 text-[var(--color-ink-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? <div className="space-y-3 border-t border-[var(--color-border)] p-3">{children}</div> : null}
    </section>
  );
}

type PlayerTimeProps = {
  player: PlayerSlug;
  totalSec: number;
  savedSec: number;
  liveMs: number;
  label: string;
  minutesLabel: string;
  secondsLabel: string;
  onSetTotalSec: (sec: number) => void;
  liveLabel: string;
};

function PlayerGameTimeWheel({
  player,
  totalSec,
  savedSec,
  liveMs,
  label,
  minutesLabel,
  secondsLabel,
  onSetTotalSec,
  liveLabel,
}: PlayerTimeProps) {
  const wheelId = useId();
  const { min, sec } = bankParts(totalSec);
  const [mins, setMins] = useState(min);
  const [secs, setSecs] = useState(sec);
  const dirty = totalSec !== savedSec;

  useEffect(() => {
    const p = bankParts(totalSec);
    setMins(p.min);
    setSecs(p.sec);
  }, [totalSec]);

  const commit = useCallback(
    (m: number, s: number) => {
      let minutes = m;
      let seconds = s;
      if (minutes >= 15) {
        minutes = 15;
        seconds = 0;
      }
      onSetTotalSec(Math.min(MAX_BANK_SEC, minutes * 60 + seconds));
    },
    [onSetTotalSec],
  );

  const setMinutes = (m: number) => {
    setMins(m);
    const s = m >= 15 ? 0 : secs;
    if (m >= 15) setSecs(0);
    commit(m, s);
  };

  const setSeconds = (s: number) => {
    const m = mins >= 15 ? 15 : mins;
    const clampedSec = m >= 15 ? 0 : s;
    setSecs(clampedSec);
    commit(m, clampedSec);
  };

  const atMaxMinute = mins >= 15;

  return (
    <div
      className={`rounded-[var(--radius-md)] border bg-[var(--color-surface-raised)] p-3 ${
        dirty ? "border-[var(--color-brand)]" : "border-[var(--color-border)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <PlayerMark player={player} label={label} size={16} className="w-[4.5rem] shrink-0 text-sm font-medium" />
        <div className="flex flex-1 items-center justify-center gap-1" dir="ltr">
          <LoopWheel min={0} max={15} value={mins} onChange={setMinutes} aria-label={`${minutesLabel} ${wheelId}-m`} />
          <span className="font-mono text-xl font-semibold tabular-nums text-[var(--color-ink-muted)]">:</span>
          {atMaxMinute ? (
            <span className="flex h-[6.625rem] w-12 items-center justify-center font-mono text-lg font-semibold tabular-nums">00</span>
          ) : (
            <LoopWheel min={0} max={59} value={secs} onChange={setSeconds} aria-label={`${secondsLabel} ${wheelId}-s`} />
          )}
        </div>
        <div className="w-16 text-end" dir="ltr">
          <span className="block font-mono text-sm font-semibold tabular-nums text-[var(--color-ink)]">{formatMs(liveMs)}</span>
          <span className="block text-[0.65rem] text-[var(--color-ink-faint)]">{liveLabel}</span>
        </div>
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  clock: ClockState;
  onClose: () => void;
  onSettings: (s: ClockSettings) => void;
  onAdjust: (p: PlayerSlug, deltaSec: number) => void;
  onSaveGameTimes: (bankSec: Record<PlayerSlug, number>) => void;
};

export function ClockSettingsSheet({
  open,
  clock,
  onClose,
  onSettings,
  onAdjust,
  onSaveGameTimes,
}: Props) {
  const { t } = useI18n();
  const { settings } = clock;
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [draftBankSec, setDraftBankSec] = useState(settings.bankSec);
  const [baselineSec, setBaselineSec] = useState(settings.bankSec);
  const [confirmClose, setConfirmClose] = useState(false);
  const wasOpenRef = useRef(false);

  const dirty = gameTimeDirty(baselineSec, draftBankSec);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const baseline = gameTimeBaseline(clock);
      setDraftBankSec(baseline);
      setBaselineSec(baseline);
      setConfirmClose(false);
    }
    wasOpenRef.current = open;
  }, [open, clock]);

  const requestClose = useCallback(() => {
    if (dirty) setConfirmClose(true);
    else onClose();
  }, [dirty, onClose]);

  const saveAndClose = () => {
    onSaveGameTimes(draftBankSec);
    setConfirmClose(false);
    onClose();
  };

  const discardAndClose = () => {
    setDraftBankSec({ ...baselineSec });
    setConfirmClose(false);
    onClose();
  };

  const applyPreset = (preset: ClockSettings) => {
    onSettings(preset);
    const banks = { ...preset.bankSec };
    setDraftBankSec(banks);
    setBaselineSec(banks);
    setConfirmClose(false);
  };

  const stepInterval = (delta: number) => {
    const next = Math.min(120, Math.max(0, settings.delaySec + delta));
    onSettings({ ...settings, delaySec: next });
  };

  return (
    <BottomSheet open={open} title={t.timer.settings} onClose={requestClose}>
      <div className="space-y-5">
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t.clockSettings.gameTime}</h3>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{t.clockSettings.gameTimeHint}</p>
          <div className="mt-3 space-y-2">
            {PLAYER_SLUGS.map((p) => (
              <PlayerGameTimeWheel
                key={p}
                player={p}
                totalSec={draftBankSec[p]}
                savedSec={baselineSec[p]}
                liveMs={clock.bankMs[p]}
                label={t.players[p]}
                minutesLabel={t.clockSettings.minutes}
                secondsLabel={t.clockSettings.seconds}
                liveLabel={t.clockSettings.onClock}
                onSetTotalSec={(sec) => setDraftBankSec((prev) => ({ ...prev, [p]: sec }))}
              />
            ))}
          </div>
        </section>

        <CollapsibleSection title={t.clockSettings.correction} open={correctionOpen} onToggle={() => setCorrectionOpen((o) => !o)}>
          <p className="text-xs text-[var(--color-ink-muted)]">{t.clockSettings.correctionHint}</p>
          <div className="space-y-2">
            {PLAYER_SLUGS.map((p) => (
              <div key={p} className="flex flex-wrap items-center gap-2">
                <PlayerMark player={p} label={t.players[p]} size={16} className="w-[4.5rem] shrink-0 text-sm font-medium" />
                <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-ink-muted)]" dir="ltr">
                  {formatMs(clock.bankMs[p])}
                </span>
                <div className="flex flex-1 flex-wrap justify-end gap-1" dir="ltr">
                  {CORRECTION_DELTAS.map((d) => (
                    <button key={d} type="button" className={correctionBtn} onClick={() => onAdjust(p, d)}>
                      {d > 0 ? "+" : "−"}
                      {Math.abs(d)}s
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <section>
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t.clockSettings.interval}</h3>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{t.clockSettings.intervalHint}</p>
          <div className="mt-3 flex items-center justify-center gap-3" dir="ltr">
            <button type="button" className={stepBtn} aria-label={t.clockSettings.decreaseInterval} onClick={() => stepInterval(-1)}>
              −
            </button>
            <span className="min-w-[4rem] text-center font-mono text-2xl font-semibold tabular-nums">{settings.delaySec}s</span>
            <button type="button" className={stepBtn} aria-label={t.clockSettings.increaseInterval} onClick={() => stepInterval(1)}>
              +
            </button>
          </div>
        </section>

        <CollapsibleSection title={t.clockSettings.presets} open={presetsOpen} onToggle={() => setPresetsOpen((o) => !o)}>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className={presetBtn} dir="ltr" onClick={() => applyPreset(p.settings)}>
                {p.label}
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {confirmClose ? (
          <div
            className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] p-4"
            role="alertdialog"
            aria-labelledby="clock-unsaved-title"
            aria-describedby="clock-unsaved-body"
          >
            <p id="clock-unsaved-title" className="font-semibold text-[var(--color-ink)]">
              {t.clockSettings.unsavedGameTimeTitle}
            </p>
            <p id="clock-unsaved-body" className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {t.clockSettings.unsavedGameTimeBody}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={saveAndClose}
                className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-brand)] font-semibold text-white"
              >
                {t.clockSettings.saveGameTime}
              </button>
              <button
                type="button"
                onClick={discardAndClose}
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] font-semibold text-[var(--color-ink)]"
              >
                {t.clockSettings.discardGameTime}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="h-11 w-full text-sm font-medium text-[var(--color-ink-muted)]"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={requestClose}
            className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-brand)] font-semibold text-white"
          >
            {t.common.close}
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
