"use client";

import { useFx } from "@/components/motion/FxProvider";
import { PanicPile } from "@/components/motion/PanicPile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { GoldCrown } from "@/components/board/GoldCrown";
import { ClockPoints } from "@/components/board/ClockPoints";
import { PointsRow } from "@/components/board/PointsRow";
import { PlayerMark } from "@/components/board/PlayerMark";
import { playerFill } from "@/lib/player-style";
import { addGame, deleteGame } from "@/actions/game";
import { finishSession } from "@/actions/session";
import { ClockSettingsSheet } from "@/components/timer/ClockSettingsSheet";
import { beep, buzz, useWakeLock } from "@/components/timer/useWakeLock";
import { WinnerSheet } from "@/components/timer/WinnerSheet";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useI18n } from "@/lib/i18n/client";
import { IconButton } from "@/components/ui/IconButton";
import { FlagIcon, PauseIcon, PlayIcon, SettingsIcon, UndoIcon } from "@/components/ui/icons";
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
  const fx = useFx();
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
      fx({ kind: "flag", loser: flagged });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWinnerOpen(true);
    }
  }, [flagged, fx]);

  const summary = useMemo(() => summarizeGames(scored), [scored]);

  // Any tap on either cube hands the turn over. The first tap starts the
  // opponent of the tapped player. Paused / flagged clocks ignore taps.
  const onHalfTap = (p: PlayerSlug) => {
    if (clock.status === "idle") {
      buzz(20);
      fx({ kind: "rattle" });
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
      fx({ kind: "save", winner, winType });
      if (winType !== "normal") {
        window.setTimeout(() => fx({ kind: "cube", winner, rain: winType === "backgammon", big: true }), 1900);
      }
      setSavedOpen(true);
    });
  };

  const nextGame = () => {
    setSavedOpen(false);
    setClock(createClock(clock.settings));
  };

  const finish = () => {
    const id = sessionId;
    if (summary.leader) fx({ kind: "cube", winner: summary.leader, rain: false, big: false });
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

  // Player-color law: Niv always dark, Gilad always light (see lib/player-style).
  const PLAYER_TONE: Record<PlayerSlug, string> = {
    niv: playerFill("niv"),
    gilad: playerFill("gilad"),
  };

  const renderHalf = (p: PlayerSlug, flip?: boolean) => {
    const live = shown.status === "running";
    const isActive = shown.active === p && (live || shown.status === "paused");
    const isFlagged = shown.flagged === p;
    const panic = isActive && live && shown.bankMs[p] > 0 && shown.bankMs[p] <= 10000;
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
        style={{ "--outline-c": p === "niv" ? "var(--color-walnut-deep)" : "var(--player-gilad-fill)" } as React.CSSProperties}
        className={`relative flex flex-1 select-none flex-col items-center justify-center gap-1 overflow-hidden transition ${PLAYER_TONE[p]} ${ring} ${dim} ${flip ? "rotate-180" : ""}`}
      >
        <ClockPoints player={p} />
        <span className="text-outlined relative text-sm font-semibold">
          {t.players[p]} · {t.timer.points(mine.points, mine.games)}
        </span>
        <span data-clock className="text-outlined relative font-mono text-7xl font-semibold tabular-nums [--outline-w:9px]" dir="ltr">
          {formatMs(shown.bankMs[p])}
        </span>
        <span className="text-outlined relative h-6 text-sm font-semibold tabular-nums" dir="ltr">
          {hint}
        </span>
        {panic ? <PanicPile player={p} /> : null}
      </button>
    );
  };

  const crownBtn = (p: PlayerSlug, flip?: boolean) => (
    <button
      type="button"
      onClick={() => openWinner(p)}
      aria-label={t.timer.winnerOf(t.players[p])}
      title={t.timer.winnerOf(t.players[p])}
      className={`inline-flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-full transition ${flip ? "rotate-180" : ""}`}
    >
      <span
        className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full p-[5px]"
        style={{
          background: "conic-gradient(from 200deg, #fff0b0, #d4a017, #8f650e, #f4c64a, #fff0b0)",
          boxShadow: "var(--shadow-checker), 0 0 10px rgb(244 198 74 / 0.45)",
        }}
      >
        <span
          className="flex h-full w-full items-center justify-center rounded-full"
          style={{
            background:
              p === "niv"
                ? "radial-gradient(circle at 35% 28%, #6a4128 0%, var(--player-niv-fill) 55%, #1c0e07 100%)"
                : "radial-gradient(circle at 35% 28%, #ffffff 0%, var(--player-gilad-fill) 55%, #cdbf9f 100%)",
            boxShadow: "inset 0 2px 4px rgb(0 0 0 / 0.35)",
          }}
        >
          <GoldCrown size={30} />
        </span>
      </span>
    </button>
  );

  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] top-[3.75rem] z-20 flex flex-col overflow-hidden bg-[var(--color-walnut-deep)] sm:hidden">
        {renderHalf("gilad", true)}
        <div dir="ltr" className="relative flex items-center justify-between gap-2 border-y-2 border-[var(--color-gold)] px-4 py-3">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-[var(--player-niv-fill)]" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[var(--player-gilad-fill)]" />
          <span aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            <PointsRow height={8} />
          </span>
          <span className="relative">{crownBtn("gilad", true)}</span>
          <div className="wood relative flex items-center rounded-full border-2 border-[var(--color-gold)] px-1 shadow-[var(--shadow-die)]">
            <IconButton tone="onDark" label={t.timer.settings} onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
            <IconButton tone="onDark" label={t.timer.undo} disabled={scored.length === 0 || pending} onClick={undoLast}>
              <UndoIcon />
            </IconButton>
            {clock.status === "paused" ? (
              <IconButton tone="onDark" label={t.timer.resume} onClick={() => commit(resume)}>
                <PlayIcon />
              </IconButton>
            ) : (
              <IconButton tone="onDark" label={t.timer.pause} disabled={clock.status !== "running"} onClick={() => commit(pause)}>
                <PauseIcon />
              </IconButton>
            )}
            <IconButton tone="onDark" label={t.timer.finish} disabled={scored.length === 0} onClick={() => setSavedOpen(true)}>
              <FlagIcon />
            </IconButton>
          </div>
          <span className="relative">{crownBtn("niv")}</span>
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
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-ink-muted)]" dir="ltr">
          <PlayerMark player="niv" label={`${t.players.niv} ${summary.niv.points} (${summary.niv.games})`} />
          <span aria-hidden>–</span>
          <PlayerMark player="gilad" label={`${summary.gilad.points} (${summary.gilad.games}) ${t.players.gilad}`} />
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
