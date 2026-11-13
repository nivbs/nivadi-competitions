"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useSyncExternalStore } from "react";

import { Checker } from "@/components/board/Checker";
import { Die } from "@/components/board/Die";
import { useI18n } from "@/lib/i18n/client";

gsap.registerPlugin(useGSAP);

const STORAGE_KEY = "nivadi-intro-seen";

let introVersion = 0;
const listeners = new Set<() => void>();

function subscribeIntro(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getIntroSeenSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  void introVersion;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerIntroSnapshot(): boolean {
  return false;
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  introVersion += 1;
  listeners.forEach((cb) => {
    cb();
  });
}

export function SheshBeshIntro() {
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});
  const introSeen = useSyncExternalStore(
    subscribeIntro,
    () => getIntroSeenSnapshot(),
    getServerIntroSnapshot,
  );
  const visible = !introSeen;

  useGSAP(
    () => {
      if (!visible || !root.current) {
        return;
      }

      const mm = gsap.matchMedia(root.current);

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.current, { autoAlpha: 0, pointerEvents: "none" });
        markIntroSeen();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root.current!);
        const [die1, die2] = q("[data-die]");
        const label = q("[data-label]");
        const frame = q("[data-frame]");
        const roller = q("[data-roller]");
        const quip = q("[data-quip]");
        const w = window.innerWidth;
        const h = window.innerHeight;
        const frameW = (frame[0] as HTMLElement).offsetWidth;

        gsap.set(root.current, { autoAlpha: 1 });
        gsap.set(frame, { scale: 0.9, autoAlpha: 0 });
        gsap.set(label, { autoAlpha: 0, scale: 0.2 });
        gsap.set(quip, { autoAlpha: 0, y: 14 });
        gsap.set(roller, { x: -34, rotation: 0, autoAlpha: 0 });
        gsap.set(die1, { x: -w, y: -h * 0.7, rotation: -900 });
        gsap.set(die2, { x: w, y: -h * 0.8, rotation: 900 });

        let closing = false;
        const close = () => {
          if (closing) return;
          closing = true;
          tl.kill();
          gsap.to(root.current, {
            autoAlpha: 0,
            duration: 0.35,
            ease: "power2.inOut",
            onComplete: markIntroSeen,
          });
        };
        skip.current = close;

        const tl = gsap.timeline({ onComplete: () => { gsap.delayedCall(0.5, close); } });

        tl.to(frame, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "expo.out" }, 0)
          // Throw: x flies in smoothly, y bounces like a real roll.
          .to(die1, { x: 0, rotation: 0, duration: 0.95, ease: "power2.out" }, 0.1)
          .to(die1, { y: 0, duration: 0.95, ease: "bounce.out" }, 0.1)
          .to(die2, { x: 0, rotation: 0, duration: 1.05, ease: "power2.out" }, 0.25)
          .to(die2, { y: 0, duration: 1.05, ease: "bounce.out" }, 0.25)
          // The first thud knocks the title in.
          .to(label, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" }, 0.55)
          .to(frame, { y: 6, duration: 0.07, yoyo: true, repeat: 3, ease: "none" }, 0.55)
          // A checker rolls along the top edge and falls off.
          .to(roller, { autoAlpha: 1, duration: 0.1 }, 1.25)
          .to(roller, { x: frameW + 10, rotation: 720, duration: 0.9, ease: "none" }, 1.25)
          .to(roller, { x: frameW + 70, y: 420, rotation: 1100, duration: 0.7, ease: "power2.in" }, 2.15)
          .to(quip, { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out" }, 1.6);

        return () => {
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [visible], revertOnUpdate: true },
  );

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={root}
      className="wood fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-6 overflow-hidden px-6"
      aria-hidden="true"
      onClick={() => skip.current()}
    >
      <div
        data-frame
        className="relative flex max-w-sm flex-col items-center gap-6 felt stitched rounded-[var(--radius-lg)] border-4 border-[var(--color-walnut-frame)] px-8 py-10 shadow-[var(--shadow-die)]"
      >
        <p
          data-label
          className="text-center font-display text-2xl font-bold text-[var(--color-ink)]"
        >
          {t.app.game}
        </p>
        <div className="flex items-center gap-4" dir="ltr">
          <Die face={6} size={84} data-die />
          <Die face={5} size={84} data-die />
        </div>
        <span data-roller className="absolute -top-7 left-0" dir="ltr">
          <Checker player="gilad" size={44} />
        </span>
      </div>
      <p data-quip className="font-display text-xl font-bold text-[var(--color-cream)]">
        {t.fx.quip}
      </p>
    </div>
  );
}
