"use client";

import gsap from "gsap";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { FxView, type FxEvent } from "@/components/motion/effects";

type Play = (event: FxEvent) => void;

const FxContext = createContext<Play>(() => {});

/** Fire a one-shot animation (checkers, dice, cube, flag). No-op under reduced motion. */
export function useFx(): Play {
  return useContext(FxContext);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Live = { id: number; event: FxEvent };

export function FxProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<Live[]>([]);
  const nextId = useRef(0);

  const play = useCallback<Play>((event) => {
    if (prefersReducedMotion()) return;
    const id = nextId.current++;
    setLive((all) => [...all, { id, event }]);
  }, []);

  const done = useCallback((id: number) => {
    setLive((all) => all.filter((x) => x.id !== id));
  }, []);

  // Buttons and links press down like a checker.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let pressed: HTMLElement | null = null;
    const release = () => {
      if (!pressed) return;
      gsap.to(pressed, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.45)", overwrite: "auto", clearProps: "scale" });
      pressed = null;
    };
    const down = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("button, a[href]");
      if (!el || (el as HTMLButtonElement).disabled) return;
      // Skip huge surfaces (timer halves) and rotated ones.
      if (el.offsetHeight > 180 || el.className.includes("rotate-180")) return;
      pressed = el;
      gsap.to(el, { scale: 0.93, duration: 0.09, ease: "power2.out", overwrite: "auto" });
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
    };
  }, []);

  const value = useMemo(() => play, [play]);
  return (
    <FxContext.Provider value={value}>
      {children}
      {live.map((l) => (
        <FxView key={l.id} event={l.event} onDone={() => done(l.id)} />
      ))}
    </FxContext.Provider>
  );
}
