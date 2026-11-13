"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { addGame, deleteGame } from "@/actions/game";
import { finishSession } from "@/actions/session";
import { ClockSettingsSheet } from "@/components/timer/ClockSettingsSheet";
import { beep, buzz, useWakeLock } from "@/components/timer/useWakeLock";
import { WinnerSheet } from "@/components/timer/WinnerSheet";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useI18n } from "@/lib/i18n/client";
import { IconButton } from "@/components/ui/IconButton";
import { CrownIcon, FlagIcon, PauseIcon, PlayIcon, SettingsIcon, UndoIcon } from "@/components/ui/icons";
import {
  adjustBank,
  applySettings,
  createClock,
  DEFAULT_SETTINGS,
  formatMs,
  pause,
  resume,
  start,
  switchTurn,
  tick,
  usedSeconds,
  type ClockSettings,
  type ClockState,
} from "@/lib/clock/engine";
import {
  opponentOf,
  summarizeGames,
  type PlayerSlug,
  type ScoredGame,
  type WinType,
} from "@/lib/scoring";

const STORAGE_KEY = "nivadi-timer-v1";

type Persisted = {
  clock: ClockState;
  sessionId: string | null;
  scored: (ScoredGame & { id: string })[];
};

export type ResumeSession = {
  id: string;
  games: (ScoredGame & { id: string })[];
};

function readStorage(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

export function TimerClient({ resume: resumeSession }: { resume: ResumeSession | null }) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();

  const [clock, setClock] = useState<ClockState>(() => createClock(DEFAULT_SETTINGS));
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scored, setScored] = useState<Persisted["scored"]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);

  const [winnerOpen, setWinnerOpen] = useState(false);
  const [crownWinner, setCrownWinner] = useState<PlayerSlug | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [error, setError] = useState<string>();

  // Hydrate from localStorage, or from a session chosen via ?session=
  useEffect(() => {
    const saved = readStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setClock(saved.clock);
    if (resumeSession) {
      setSessionId(resumeSession.id);
      setScored(resumeSession.games);
    } else if (saved) {
      setSessionId(saved.sessionId);
      setScored(saved.scored);
    }
    setNow(Date.now());
    setHydrated(true);
  }, [resumeSession]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ clock, sessionId, scored } satisfies Persisted));
  }, [hydrated, clock, sessionId, scored]);

  const running = clock.status === "running";
  useWakeLock(running);

  const commit = useCallback((fn: (c: ClockState, t: number) => ClockState) => {
    setClock((c) => fn(c, Date.now()));
  }, []);

  // Display ticker + flag detection.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setClock((c) => {
        const next = tick(c, t);
        return next.status === "flagged" ? next : c;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const shown = useMemo(() => (running ? tick(clock, now) : clock), [clock, now, running]);

  // When flagged: signal and open winner sheet.
  const flagged = clock.status === "flagged" ? clock.flagged : null;
  useEffect(() => {
    if (flagged) {
      beep();
      buzz([200, 100, 200]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWinnerOpen(true);
    }
  }, [flagged]);

  const summary = useMemo(() => summarizeGames(scored), [scored]);

  // Any tap on either cube hands the turn over. The first tap starts the
  // opponent of the tapped player. Paused / flagged clocks ignore taps.
  const onHalfTap = (p: PlayerSlug) => {
    if (clock.status === "idle") {
      buzz(20);
      commit((c, t) => start(c, p, t));
    } else if (clock.status === "running") {
      buzz(20);
      commit(switchTurn);
    }
  };

  const openWinner = (p: PlayerSlug) => {
    setError(undefined);
    setCrownWinner(p);
    commit(pause);
    setWinnerOpen(true);
  };

  const closeWinner = () => {
    setWinnerOpen(false);
    setCrownWinner(null);
  };

  const save = (winner: PlayerSlug, winType: WinType) => {
    setError(undefined);
    const final = tick(clock, Date.now());
    const used = usedSeconds(final);
    startTransition(async () => {
      const res = await addGame(sessionId, {
        winner,
        winType,
        nivTimeUsedSec: used.niv,
        giladTimeUsedSec: used.gilad,
        bankSec: clock.settings.bankSec.niv,
        delaySec: clock.settings.delaySec,
        timedOut: clock.status === "flagged",
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSessionId(res.data.sessionId);
      setScored((s) => [...s, { id: res.data.gameId, winner, winType }]);
      closeWinner();
      setSavedOpen(true);
    });
  };

  const nextGame = () => {
    setSavedOpen(false);
    setClock(createClock(clock.settings));
  };

  const finish = () => {
    const id = sessionId;
    startTransition(async () => {
      if (id) {
        const res = await finishSession(id);
        if (!res.ok) {
          setError(res.message);
          return;
        }
      }
      localStorage.removeItem(STORAGE_KEY);
      setSavedOpen(false);
      setSessionId(null);
      setScored([]);
      setClock(createClock(clock.settings));
      if (id) router.push(`/history/${id}`);
    });
  };

  const undoLast = () => {
    const last = scored[scored.length - 1];
    if (!last) return;
    startTransition(async () => {
      const res = await deleteGame(last.id);
      if (res.ok) setScored((s) => s.slice(0, -1));
      else setError(res.message);
    });
  };

  const flaggedLoser = clock.flagged;
  const presetWinner = flaggedLoser ? opponentOf(flaggedLoser) : null;

  // Fixed colours per player: an exact inverse pair (ink on surface / surface on ink).
  const PLAYER_TONE: Record<PlayerSlug, string> = {
    niv: "bg-[var(--color-ink)] text-[var(--color-surface)]",
    gilad: "bg-[var(--color-surface)] text-[var(--color-ink)]",
  };

  const renderHalf = (p: PlayerSlug, flip?: boolean) => {
    const live = shown.status === "running";
    const isActive = shown.active === p && (live || shown.status === "paused");
    const isFlagged = shown.flagged === p;
    const inDelay = isActive && live && shown.delayLeftMs > 0;
    const ring = isFlagged
      ? "ring-8 ring-inset ring-[var(--color-danger)]"
      : isActive && live
        ? "ring-8 ring-inset ring-[var(--color-accent)]"
        : "";
    const dim = shown.status === "paused" || (live && !isActive) ? "opacity-60" : "";
    const mine = p === "niv" ? summary.niv : summary.gilad;
    const hint = isFlagged
      ? t.timer.timeUpLabel
      : inDelay
        ? t.timer.delayLeft(Math.ceil(shown.delayLeftMs / 1000))
        : shown.status === "idle"
          ? t.timer.tapToStart
          : shown.status === "paused"
            ? t.timer.pausedLabel
            : "";
    return (
      <button
        key={p}
        type="button"
        onClick={() => onHalfTap(p)}
        aria-label={t.timer.clockOf(t.players[p])}
        className={`flex flex-1 select-none flex-col items-center justify-center gap-1 transition ${PLAYER_TONE[p]} ${ring} ${dim} ${flip ? "rotate-180" : ""}`}
      >
        <span className="text-sm font-medium opacity-80">
          {t.players[p]} · {t.timer.points(mine.points, mine.games)}
        </span>
        <span className="font-mono text-7xl font-semibold tabular-nums" dir="ltr">
          {formatMs(shown.bankMs[p])}
        </span>
        <span className="h-6 text-sm font-medium tabular-nums opacity-90" dir="ltr">
          {hint}
        </span>
      </button>
    );
  };

  const crownBtn = (p: PlayerSlug, flip?: boolean) => (
    <button
      type="button"
      onClick={() => openWinner(p)}
      aria-label={t.timer.winnerOf(t.players[p])}
      title={t.timer.winnerOf(t.players[p])}
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent-muted)] transition active:scale-90 ${flip ? "rotate-180" : ""}`}
    >
      <CrownIcon width={26} height={26} />
    </button>
  );

  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] top-[3.75rem] z-20 flex flex-col overflow-hidden bg-[var(--color-canvas)] sm:hidden">
        {renderHalf("gilad", true)}
        <div dir="ltr" className="flex items-center justify-between gap-2 border-y border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2">
          {crownBtn("gilad", true)}
          <div className="flex items-center">
            <IconButton label={t.timer.settings} onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
            <IconButton label={t.timer.undo} disabled={scored.length === 0 || pending} onClick={undoLast}>
              <UndoIcon />
            </IconButton>
            {clock.status === "paused" ? (
              <IconButton label={t.timer.resume} onClick={() => commit(resume)}>
                <PlayIcon />
              </IconButton>
            ) : (
              <IconButton label={t.timer.pause} disabled={clock.status !== "running"} onClick={() => commit(pause)}>
                <PauseIcon />
              </IconButton>
            )}
            <IconButton label={t.timer.finish} disabled={scored.length === 0} onClick={() => setSavedOpen(true)}>
              <FlagIcon />
            </IconButton>
          </div>
          {crownBtn("niv")}
        </div>
        {renderHalf("niv")}

      <ClockSettingsSheet
        open={settingsOpen}
        clock={shown}
        onClose={() => setSettingsOpen(false)}
        onSettings={(s: ClockSettings) => commit((c, t) => applySettings(c, s, t))}
        onAdjust={(p, d) => commit((c, t) => adjustBank(c, p, d, t))}
      />

      <WinnerSheet
        open={winnerOpen}
        presetWinner={crownWinner ?? presetWinner}
        timedOutNote={
          flaggedLoser ? t.timer.timeUp(t.players[flaggedLoser]) : undefined
        }
        pending={pending}
        error={error}
        onClose={closeWinner}
        onSave={save}
      />

      <BottomSheet open={savedOpen} title={scored.length ? t.timer.savedGame(scored.length) : t.timer.finish} onClose={() => setSavedOpen(false)}>
        <p className="text-sm text-[var(--color-ink-muted)]" dir="ltr">
          {t.players.niv} {summary.niv.points} ({summary.niv.games}) – {summary.gilad.points} ({summary.gilad.games}) {t.players.gilad}
        </p>
        <div className="mt-5 grid gap-3">
          <button type="button" onClick={nextGame} className="h-12 rounded-[var(--radius-md)] bg-[var(--color-brand)] font-semibold text-white">
            {t.timer.nextGame}
          </button>
          <button
            type="button"
            onClick={finish}
            disabled={pending}
            className="h-12 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] font-semibold text-[var(--color-ink)] disabled:opacity-60"
          >
            {t.timer.finish}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
      </BottomSheet>
      </div>

      <div className="mx-auto hidden max-w-md flex-col items-center gap-3 px-6 py-16 text-center sm:flex">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">{t.timer.mobileOnlyTitle}</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">{t.timer.mobileOnlyBody}</p>
        <Link href="/" className="font-medium text-[var(--color-brand)] underline">
          {t.timer.mobileOnlyHome}
        </Link>
      </div>
    </>
  );
}
