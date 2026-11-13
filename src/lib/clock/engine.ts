import type { PlayerSlug } from "@/lib/scoring";
import { opponentOf } from "@/lib/scoring";

export type ClockSettings = {
  bankSec: Record<PlayerSlug, number>;
  /** Free seconds at the start of each turn; never carries over. */
  delaySec: number;
};

export const DEFAULT_SETTINGS: ClockSettings = {
  bankSec: { niv: 360, gilad: 360 },
  delaySec: 0,
};

export type ClockStatus = "idle" | "running" | "paused" | "flagged";

export type ClockState = {
  status: ClockStatus;
  /** Whose clock is (or will be, when resumed) counting. */
  active: PlayerSlug | null;
  bankMs: Record<PlayerSlug, number>;
  delayLeftMs: number;
  /** Total running time per player this game (delay + bank). */
  elapsedMs: Record<PlayerSlug, number>;
  settings: ClockSettings;
  /** Timestamp of the last accounted tick while running. */
  lastTickAt: number | null;
  /** Player whose bank hit zero. */
  flagged: PlayerSlug | null;
};

export function createClock(settings: ClockSettings): ClockState {
  return {
    status: "idle",
    active: null,
    bankMs: {
      niv: settings.bankSec.niv * 1000,
      gilad: settings.bankSec.gilad * 1000,
    },
    delayLeftMs: settings.delaySec * 1000,
    elapsedMs: { niv: 0, gilad: 0 },
    settings,
    lastTickAt: null,
    flagged: null,
  };
}

/** Account for time passed since the last tick. Pure; returns a new state. */
export function tick(state: ClockState, now: number): ClockState {
  if (state.status !== "running" || !state.active || state.lastTickAt === null) {
    return state;
  }
  let remaining = Math.max(0, now - state.lastTickAt);
  const p = state.active;
  let delayLeftMs = state.delayLeftMs;
  let bank = state.bankMs[p];
  let elapsed = state.elapsedMs[p];

  const inDelay = Math.min(delayLeftMs, remaining);
  delayLeftMs -= inDelay;
  remaining -= inDelay;
  elapsed += inDelay;

  const fromBank = Math.min(bank, remaining);
  bank -= fromBank;
  elapsed += fromBank;

  const next: ClockState = {
    ...state,
    delayLeftMs,
    bankMs: { ...state.bankMs, [p]: bank },
    elapsedMs: { ...state.elapsedMs, [p]: elapsed },
    lastTickAt: now,
  };
  if (bank <= 0) {
    return { ...next, status: "flagged", flagged: p, lastTickAt: null };
  }
  return next;
}

/**
 * First tap: the tapping player just "finished" their move, so the
 * opponent's clock starts counting.
 */
export function start(state: ClockState, tappedPlayer: PlayerSlug, now: number): ClockState {
  if (state.status !== "idle") return state;
  return { ...state, status: "running", active: opponentOf(tappedPlayer), lastTickAt: now };
}

/** The active player finished their turn: hand over to the opponent. */
export function switchTurn(state: ClockState, now: number): ClockState {
  const t = tick(state, now);
  if (t.status !== "running" || !t.active) return t;
  return {
    ...t,
    active: opponentOf(t.active),
    delayLeftMs: t.settings.delaySec * 1000,
    lastTickAt: now,
  };
}

export function pause(state: ClockState, now: number): ClockState {
  const t = tick(state, now);
  if (t.status !== "running") return t;
  return { ...t, status: "paused", lastTickAt: null };
}

export function resume(state: ClockState, now: number): ClockState {
  if (state.status !== "paused" || !state.active) return state;
  return { ...state, status: "running", lastTickAt: now };
}

/** Add (or remove) bank time for a player at any moment. Unflags when time is restored. */
export function adjustBank(
  state: ClockState,
  player: PlayerSlug,
  deltaSec: number,
  now: number,
): ClockState {
  const t = tick(state, now);
  const bank = Math.max(0, t.bankMs[player] + deltaSec * 1000);
  let next: ClockState = { ...t, bankMs: { ...t.bankMs, [player]: bank } };
  if (next.status === "flagged" && next.flagged === player && bank > 0) {
    next = { ...next, status: "paused", flagged: null, lastTickAt: null };
  } else if (next.status === "running" && bank <= 0 && next.active === player) {
    next = { ...next, status: "flagged", flagged: player, lastTickAt: null };
  }
  return next;
}

/** Change settings. Only affects the bank immediately while nothing has been played. */
export function applySettings(state: ClockState, settings: ClockSettings, now: number): ClockState {
  const t = tick(state, now);
  const pristine = t.status === "idle";
  return {
    ...t,
    settings,
    bankMs: pristine
      ? { niv: settings.bankSec.niv * 1000, gilad: settings.bankSec.gilad * 1000 }
      : t.bankMs,
    delayLeftMs: pristine ? settings.delaySec * 1000 : t.delayLeftMs,
  };
}

export function displayState(state: ClockState, now: number): ClockState {
  return tick(state, now);
}

/** Rounded seconds used per player, for saving. */
export function usedSeconds(state: ClockState): Record<PlayerSlug, number> {
  return {
    niv: Math.round(state.elapsedMs.niv / 1000),
    gilad: Math.round(state.elapsedMs.gilad / 1000),
  };
}

export function formatMs(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
