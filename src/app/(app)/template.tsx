"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

/** Page change = the board flips up into place. Skipped on the timer (it holds fixed layers). */
export default function AppTemplate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (pathname.startsWith("/timer")) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { rotateX: -16, y: 18, autoAlpha: 0, transformPerspective: 900, transformOrigin: "50% 0%" },
          { rotateX: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: "expo.out", clearProps: "all" },
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [pathname] },
  );

  return <div ref={ref}>{children}</div>;
}
