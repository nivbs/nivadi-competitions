"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { Checker } from "@/components/board/Checker";
import type { PlayerSlug } from "@/lib/session/types";

gsap.registerPlugin(useGSAP);

/** Under 10 seconds: a nervous checker pile vibrates in the corner and the clock digits tremble. */
export function PanicPile({ player }: { player: PlayerSlug }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const checkers = gsap.utils.toArray<HTMLElement>("[data-panic]", root.current);
        const clock = root.current?.closest("button")?.querySelector<HTMLElement>("[data-clock]");
        const tweens = [
          gsap.to(checkers, { x: "random(-3, 3)", y: "random(-3, 3)", rotation: "random(-8, 8)", duration: 0.05, repeat: -1, repeatRefresh: true, yoyo: true, ease: "none" }),
        ];
        if (clock) {
          tweens.push(gsap.to(clock, { x: "random(-2.5, 2.5)", duration: 0.06, repeat: -1, repeatRefresh: true, yoyo: true, ease: "none" }));
        }
        return () => {
          tweens.forEach((tw) => tw.kill());
          if (clock) gsap.set(clock, { clearProps: "x" });
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <span ref={root} className="pointer-events-none absolute bottom-3 start-3 flex" dir="ltr" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} data-panic className={i > 0 ? "-ms-4" : ""}>
          <Checker player={player} size={32} />
        </span>
      ))}
    </span>
  );
}
