"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useSyncExternalStore, type HTMLAttributes } from "react";

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
        const dice = q("[data-die]");
        const label = q("[data-label]");
        const frame = q("[data-frame]");

        gsap.set(root.current, { autoAlpha: 1 });
        gsap.set(dice, { scale: 0.4, rotateY: -40, y: 24 });
        gsap.set(label, { autoAlpha: 0, y: 8 });
        gsap.set(frame, { scale: 0.96, autoAlpha: 0.85 });

        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => {
            gsap.to(root.current, {
              autoAlpha: 0,
              duration: 0.35,
              delay: 0.2,
              ease: "power2.inOut",
              onComplete: () => {
                markIntroSeen();
              },
            });
          },
        });

        tl.to(frame, { autoAlpha: 1, scale: 1, duration: 0.45 }, 0)
          .to(
            dice,
            {
              scale: 1,
              rotateY: 0,
              y: 0,
              stagger: 0.08,
              duration: 0.75,
            },
            0.05,
          )
          .to(label, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.35");

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
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-canvas)]/92 px-6 backdrop-blur-[2px]"
      aria-hidden="true"
    >
      <div
        data-frame
        className="relative flex max-w-sm flex-col items-center gap-6 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-8 py-10 shadow-[var(--shadow-soft)]"
      >
        <p
          data-label
          className="text-center font-semibold tracking-wide text-[var(--color-ink)]"
        >
          {t.app.game}
        </p>
        <div className="flex items-center gap-4">
          <Die face={6} data-die />
          <Die face={5} data-die />
        </div>
      </div>
    </div>
  );
}

function Die({
  face,
  ...rest
}: { face: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className="flex h-20 w-20 flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-inlay-dark)] text-[var(--color-surface)] shadow-inner"
      style={{ transformStyle: "preserve-3d" }}
    >
      <span className="font-mono text-3xl font-semibold tabular-nums" dir="ltr">
        {face}
      </span>
    </div>
  );
}
