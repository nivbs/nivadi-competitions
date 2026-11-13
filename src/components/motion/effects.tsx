"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { Checker } from "@/components/board/Checker";
import { Die, type DieFace } from "@/components/board/Die";
import { DoublingCube } from "@/components/board/DoublingCube";
import { bonk, crash } from "@/components/motion/sound";
import { CrownIcon, FlagIcon } from "@/components/ui/icons";
import { useI18n } from "@/lib/i18n/client";
import { WIN_POINTS, opponentOf, type WinType } from "@/lib/scoring";
import type { PlayerSlug } from "@/lib/session/types";

gsap.registerPlugin(useGSAP);

export type FxEvent =
  | { kind: "save"; winner: PlayerSlug; winType: WinType }
  | { kind: "cube"; winner: PlayerSlug; rain: boolean; big: boolean }
  | { kind: "rattle" }
  | { kind: "flag"; loser: PlayerSlug }
  | { kind: "reroll"; face: DieFace };

type Props = { event: FxEvent; onDone: () => void };

const layer = "pointer-events-none fixed inset-0 z-[70] overflow-hidden";

/** Shake the page chrome (header + nav), never containers that hold fixed children. */
function shakeChrome(amount = 7, times = 9) {
  const els = gsap.utils.toArray<HTMLElement>("[data-shake]");
  if (!els.length) return;
  gsap.fromTo(
    els,
    { x: -amount },
    { x: amount, duration: 0.05, repeat: times, yoyo: true, ease: "none", clearProps: "x" },
  );
}

/** Save a game: winner's checkers hop to their side, loser's checker gets flicked off with a BONK. */
function SaveFx({ event, onDone }: { event: Extract<FxEvent, { kind: "save" }>; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const n = WIN_POINTS[event.winType];
  const loser = opponentOf(event.winner);
  const dir = event.winner === "niv" ? -1 : 1; // Niv sits on the left, Gilad on the right.

  useGSAP(
    () => {
      const q = gsap.utils.selector(root.current!);
      const hoppers = q("[data-hop]");
      const victim = q("[data-victim]");
      const word = q("[data-bonk]");
      const tl = gsap.timeline({ onComplete: onDone });

      tl.fromTo(hoppers, { scale: 0, y: 40 }, { scale: 1, y: 0, duration: 0.3, stagger: 0.08, ease: "back.out(2.4)" });
      tl.fromTo(victim, { scale: 0, rotation: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, 0.1);
      hoppers.forEach((el, i) => {
        const start = 0.55 + i * 0.12;
        tl.to(el, { x: dir * (110 + i * 38), duration: 0.8, ease: "power1.inOut" }, start);
        tl.to(el, { keyframes: [{ y: -130, duration: 0.3, ease: "power2.out" }, { y: 0, duration: 0.25, ease: "power2.in" }, { y: -34, duration: 0.14, ease: "power2.out" }, { y: 0, duration: 0.12, ease: "power2.in" }] }, start);
      });
      const flickAt = 0.95;
      tl.call(() => bonk(), [], flickAt);
      tl.fromTo(word, { scale: 0, autoAlpha: 0, rotation: -12 * dir }, { scale: 1.25, autoAlpha: 1, rotation: 8 * dir, duration: 0.25, ease: "back.out(3)" }, flickAt);
      tl.to(victim, { x: -dir * 420, y: -300, rotation: -dir * 1080, duration: 0.8, ease: "power3.in" }, flickAt);
      if (event.winType !== "normal") tl.call(() => shakeChrome(event.winType === "backgammon" ? 10 : 6), [], flickAt);
      tl.to(word, { autoAlpha: 0, y: -24, duration: 0.3 }, flickAt + 0.7);
      tl.to(hoppers, { autoAlpha: 0, duration: 0.35 }, "+=0.35");
      return () => {
        tl.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={layer} aria-hidden>
      <div className="absolute inset-x-0 bottom-[34%] flex items-end justify-center" dir="ltr">
        <div className="relative" style={{ width: 0, height: 0 }}>
          <Checker data-victim player={loser} size={54} style={{ position: "absolute", left: -dir * 70 - 27, top: -54 }} />
          {Array.from({ length: n }, (_, i) => (
            <Checker data-hop key={i} player={event.winner} size={54} style={{ position: "absolute", left: -27, top: -54 }} />
          ))}
          <span
            data-bonk
            className="absolute whitespace-nowrap font-display text-4xl font-black text-[var(--color-brand)] [text-shadow:0_2px_0_var(--color-cream),0_4px_8px_rgb(0_0_0/0.4)]"
            style={{ left: -dir * 70 - 60, top: -140, opacity: 0 }}
          >
            {t.fx.bonk}
          </span>
        </div>
      </div>
    </div>
  );
}

const CUBE_VALUES = [2, 4, 8, 16, 32, 64];

/** Winner moment: the doubling cube spins up 2..64, slams down, gets a crown; loser wobbles sadly. */
function CubeFx({ event, onDone }: { event: Extract<FxEvent, { kind: "cube" }>; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const cube = useRef<HTMLDivElement>(null);
  const loser = opponentOf(event.winner);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root.current!);
      const crown = q("[data-crown]");
      const sad = q("[data-sad]");
      const rain = q("[data-rain]");
      const proxy = { i: 0 };
      const tl = gsap.timeline({ onComplete: onDone });

      tl.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0);
      tl.fromTo(cube.current, { scale: 0, rotationY: 0, y: -80 }, { scale: 1, rotationY: 1080, y: 0, duration: 1.3, ease: "power3.out" }, 0);
      tl.to(proxy, {
        i: CUBE_VALUES.length - 1,
        duration: 1.2,
        ease: "steps(5)",
        onUpdate: () => {
          if (cube.current) cube.current.textContent = String(CUBE_VALUES[Math.round(proxy.i)]);
        },
      }, 0.1);
      tl.to(cube.current, { scale: 1.7, duration: 0.18, ease: "power2.in" }, 1.3);
      tl.to(cube.current, { scale: 1, duration: 0.6, ease: "bounce.out" }, 1.48);
      tl.call(() => shakeChrome(8, 7), [], 1.5);
      tl.fromTo(crown, { y: -170, rotation: -30, autoAlpha: 0 }, { y: 0, rotation: 8, autoAlpha: 1, duration: 0.55, ease: "bounce.out" }, 1.7);
      tl.fromTo(sad, { scale: 0, autoAlpha: 0, y: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" }, 1.8);
      tl.to(sad, { rotation: 16, y: 10, duration: 0.22, repeat: 5, yoyo: true, ease: "sine.inOut" }, 2.0);
      rain.forEach((el, i) => {
        const x = gsap.utils.random(-45, 45, 1);
        tl.fromTo(el, { x: `${x}vw`, y: "-12vh", rotation: gsap.utils.random(-180, 180) }, { y: "112vh", rotation: `+=${gsap.utils.random(-540, 540)}`, duration: gsap.utils.random(1.1, 1.8), ease: "power1.in" }, 1.5 + i * 0.07);
      });
      tl.to(root.current, { autoAlpha: 0, duration: 0.4 }, "+=0.5");
      return () => {
        tl.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={layer} style={{ opacity: 0 }} aria-hidden>
      {event.rain
        ? Array.from({ length: 18 }, (_, i) => (
            <span key={i} data-rain className="absolute start-1/2 top-0">
              <Checker player={event.winner} size={36} />
            </span>
          ))
        : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center" dir="ltr" style={{ perspective: 700 }}>
        <div className="relative">
          <DoublingCube ref={cube} value={2} size={132} />
          <span data-crown className="absolute -top-14 start-1/2 -ms-9 text-[var(--color-gold)] drop-shadow-[0_3px_3px_rgb(0_0_0/0.5)]" style={{ opacity: 0 }}>
            <CrownIcon width={72} height={72} />
          </span>
        </div>
        <span data-sad className="mt-10" style={{ opacity: 0 }}>
          <Checker player={loser} size={52} />
        </span>
      </div>
    </div>
  );
}

/** Timer start: the dice rattle in a cup that isn't there. */
function RattleFx({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const dice = gsap.utils.selector(root.current!)("[data-die]");
      const tl = gsap.timeline({ onComplete: onDone });
      tl.fromTo(dice, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.2, stagger: 0.05, ease: "back.out(2)" });
      tl.to(dice, { x: "random(-16, 16)", y: "random(-14, 14)", rotation: "random(-28, 28)", duration: 0.055, repeat: 11, yoyo: true, ease: "none" });
      tl.to(dice, { x: (i: number) => (i ? 380 : -380), y: -260, rotation: (i: number) => (i ? 540 : -540), autoAlpha: 0, duration: 0.45, ease: "power3.in" });
      return () => {
        tl.kill();
      };
    },
    { scope: root },
  );
  return (
    <div ref={root} className={layer} aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center gap-3" dir="ltr">
        <Die data-die face={6} size={64} style={{ opacity: 0 }} />
        <Die data-die face={5} size={64} style={{ opacity: 0 }} />
      </div>
    </div>
  );
}

/** Timeout: a heavy flag drops on the loser's half with a cymbal crash. */
function FlagFx({ event, onDone }: { event: Extract<FxEvent, { kind: "flag" }>; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const top = event.loser === "gilad"; // Gilad's half is the upper, flipped one.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root.current!);
      const flag = q("[data-flag]");
      const tl = gsap.timeline({ onComplete: onDone });
      tl.fromTo(flag, { y: top ? "-60vh" : "-120vh", scale: 1.6, rotation: top ? 200 : 20 }, { y: 0, scale: 1, rotation: top ? 180 : 0, duration: 0.7, ease: "bounce.out" });
      tl.call(() => {
        crash();
        shakeChrome(10, 11);
        gsap.fromTo(root.current, { x: -12 }, { x: 12, duration: 0.04, repeat: 9, yoyo: true, ease: "none", clearProps: "x" });
      }, [], 0.22);
      tl.to(flag, { autoAlpha: 0, scale: 0.6, duration: 0.4 }, "+=1.1");
      return () => {
        tl.kill();
      };
    },
    { scope: root },
  );
  return (
    <div ref={root} className={layer} aria-hidden>
      <div className={`absolute inset-x-0 flex justify-center ${top ? "top-[24%]" : "bottom-[28%]"}`}>
        <span data-flag className="flex h-36 w-36 items-center justify-center rounded-full bg-[var(--color-danger)] text-white shadow-[var(--shadow-die)] ring-4 ring-[var(--color-cream)]">
          <FlagIcon width={76} height={76} />
        </span>
      </div>
    </div>
  );
}

/** Language / player switch: a single die gets re-rolled. */
function RerollFx({ event, onDone }: { event: Extract<FxEvent, { kind: "reroll" }>; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const die = gsap.utils.selector(root.current!)("[data-die]");
      const tl = gsap.timeline({ onComplete: onDone });
      tl.fromTo(die, { y: "-60vh", x: -120, rotation: -540, scale: 1.4, autoAlpha: 1 }, { x: 0, rotation: 0, duration: 0.9, ease: "power2.out" });
      tl.to(die, { y: 0, duration: 0.9, ease: "bounce.out" }, 0);
      tl.to(die, { autoAlpha: 0, scale: 0.7, duration: 0.3 }, "+=0.15");
      return () => {
        tl.kill();
      };
    },
    { scope: root },
  );
  return (
    <div ref={root} className={layer} aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center" dir="ltr">
        <Die data-die face={event.face} size={84} style={{ opacity: 0 }} />
      </div>
    </div>
  );
}

export function FxView({ event, onDone }: Props) {
  switch (event.kind) {
    case "save":
      return <SaveFx event={event} onDone={onDone} />;
    case "cube":
      return <CubeFx event={event} onDone={onDone} />;
    case "rattle":
      return <RattleFx onDone={onDone} />;
    case "flag":
      return <FlagFx event={event} onDone={onDone} />;
    case "reroll":
      return <RerollFx event={event} onDone={onDone} />;
  }
}
