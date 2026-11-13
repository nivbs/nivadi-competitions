"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function spawnCheckerHop(card: HTMLElement, player: "niv" | "gilad") {
  const hop = document.createElement("span");
  hop.setAttribute("aria-hidden", "true");
  hop.className = "pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full";
  const fill = player === "niv" ? "var(--player-niv-fill)" : "var(--player-gilad-fill)";
  const edge = player === "niv" ? "var(--player-niv-edge)" : "var(--player-gilad-edge)";
  Object.assign(hop.style, {
    width: "22px",
    height: "22px",
    background: `radial-gradient(circle at 35% 30%, ${player === "niv" ? "#6a4128" : "#fff"} 0%, ${fill} 55%, ${player === "niv" ? "#20100a" : "#cdbf9f"} 100%)`,
    boxShadow: `0 0 0 1.5px ${edge}, var(--shadow-checker)`,
  });
  card.style.position = "relative";
  card.appendChild(hop);
  gsap.fromTo(hop, { y: 8, scale: 0.6, autoAlpha: 1 }, { y: -28, scale: 1, autoAlpha: 0, duration: 0.45, ease: "power2.out", onComplete: () => hop.remove() });
}

export function useAnalysisMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    (_context, contextSafe) => {
      const root = scope.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const refresh = () => ScrollTrigger.refresh();

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 639px)",
        },
        (ctx) => {
          const { reduceMotion, mobile } = ctx.conditions ?? {};

          if (reduceMotion) {
            gsap.set(q("[data-analysis-stat], [data-analysis-footnotes]"), { clearProps: "all" });
            return;
          }

          const heroDelay = 0.15;
          const enterY = mobile ? 16 : 24;
          const batchStart = mobile ? "top 88%" : "top 85%";
          const batchMax = mobile ? 2 : 4;

          gsap.set(q("[data-analysis-stat]"), { autoAlpha: 0, y: enterY });
          gsap.set(q("[data-analysis-footnotes]"), { autoAlpha: 0, y: enterY });

          gsap.from(q("[data-analysis-title], [data-analysis-meta]"), {
            y: 14,
            autoAlpha: 0,
            duration: 0.35,
            stagger: 0.08,
            ease: "expo.out",
            delay: heroDelay,
          });

          const hero = q("[data-analysis-hero]")[0] as HTMLElement | undefined;
          if (hero) {
            const qh = gsap.utils.selector(hero);
            const vs = qh("[data-analysis-vs]")[0] as HTMLElement | undefined;
            const scores = qh("[data-analysis-score]") as HTMLElement[];
            const checkers = qh("[data-analysis-checker]") as HTMLElement[];
            const heroBars = qh('[data-analysis-bar-tier="hero"]') as HTMLElement[];
            const summary = qh("[data-analysis-summary]")[0] as HTMLElement | undefined;
            const stacks = qh("[data-analysis-stack]") as HTMLElement[];

            if (vs) gsap.set(vs, { scale: 0, rotation: -120 });
            if (summary) gsap.set(summary, { autoAlpha: 0, y: 10 });
            heroBars.forEach((el) => {
              gsap.set(el, {
                scaleX: 0,
                transformOrigin: el.getAttribute("data-player") === "niv" ? "left center" : "right center",
              });
            });
            if (checkers.length) gsap.set(checkers, { scale: 0, y: 18 });

            const tl = gsap.timeline({ delay: heroDelay + 0.05 });

            if (vs) tl.to(vs, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(1.6)" }, 0);

            scores.forEach((el, i) => {
              const target = Number(el.getAttribute("data-value") ?? el.textContent ?? 0);
              const proxy = { val: 0 };
              tl.to(
                proxy,
                {
                  val: target,
                  duration: 0.55,
                  snap: { val: 1 },
                  ease: "power2.out",
                  onUpdate: () => {
                    el.textContent = String(Math.round(proxy.val));
                  },
                },
                0.05 + i * 0.02,
              );
            });

            if (checkers.length) {
              tl.to(checkers, { scale: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "back.out(2)" }, 0.15);
            }

            if (heroBars.length) {
              tl.to(heroBars, { scaleX: 1, duration: 0.65, ease: "power3.out", stagger: 0.06 }, 0.2);
            }

            if (summary) {
              tl.to(summary, { autoAlpha: 1, y: 0, duration: 0.3, ease: "expo.out" }, 0.45);
            }

            if (stacks.length) {
              gsap.to(stacks, {
                y: -12,
                ease: "none",
                scrollTrigger: {
                  trigger: hero,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.4,
                },
              });
            }
          }

          (q("[data-analysis-row]") as HTMLElement[]).forEach((row) => {
            const bars = gsap.utils.selector(row)('[data-analysis-bar-tier="row"]') as HTMLElement[];
            if (!bars.length) return;
            bars.forEach((el) => {
              gsap.set(el, {
                transformOrigin: el.getAttribute("data-player") === "niv" ? "left center" : "right center",
              });
            });
            gsap.fromTo(
              bars,
              { scaleX: 0.5 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: row,
                  start: "top 90%",
                  end: "top 60%",
                  scrub: 0.35,
                },
              },
            );
          });

          ScrollTrigger.batch(q("[data-analysis-stat]"), {
            start: batchStart,
            once: true,
            batchMax,
            interval: 0.08,
            onEnter: (elements) => {
              gsap.to(elements, {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.08,
                ease: "expo.out",
                overwrite: true,
              });

              elements.forEach((el) => {
                el.querySelectorAll<HTMLElement>("[data-analysis-stat-value]").forEach((valueEl) => {
                  const kind = valueEl.getAttribute("data-stat-kind");
                  const raw = valueEl.getAttribute("data-value");
                  if (!kind || raw === null || raw === "") return;

                  if (kind === "percent") {
                    const target = Number(raw);
                    const proxy = { val: 0 };
                    gsap.to(proxy, {
                      val: target,
                      duration: 0.5,
                      snap: { val: 1 },
                      ease: "power2.out",
                      onUpdate: () => {
                        valueEl.textContent = `${Math.round(proxy.val)}%`;
                      },
                    });
                  } else if (kind === "int") {
                    const target = Number(raw);
                    const proxy = { val: 0 };
                    gsap.to(proxy, {
                      val: target,
                      duration: 0.5,
                      snap: { val: 1 },
                      ease: "power2.out",
                      onUpdate: () => {
                        valueEl.textContent = String(Math.round(proxy.val));
                      },
                    });
                  }
                });
              });
            },
          });

          const foot = q("[data-analysis-footnotes]")[0];
          if (foot) {
            gsap.to(foot, {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              ease: "expo.out",
              scrollTrigger: {
                trigger: foot,
                start: batchStart,
                once: true,
                toggleActions: "play none none none",
              },
            });
          }

          const runPulseStat = (card: HTMLElement) => {
            gsap
              .timeline()
              .to(card, { scale: 0.97, duration: 0.08, ease: "power2.out", overwrite: "auto" })
              .to(card, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)", clearProps: "scale" });
            const player = (card.getAttribute("data-tap-player") as "niv" | "gilad") ?? "niv";
            spawnCheckerHop(card, player);
          };

          const runPulseScore = (el: HTMLElement) => {
            gsap.fromTo(
              el,
              { scale: 1, boxShadow: "0 0 0 0 rgba(212, 166, 74, 0)" },
              {
                scale: 1.04,
                boxShadow: "0 0 0 6px rgba(212, 166, 74, 0.35)",
                duration: 0.14,
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
                clearProps: "scale,boxShadow",
              },
            );
          };

          const pulseStat = contextSafe ? contextSafe(runPulseStat) : runPulseStat;
          const pulseScore = contextSafe ? contextSafe(runPulseScore) : runPulseScore;

          const onPointerDown = (e: PointerEvent) => {
            const stat = (e.target as HTMLElement).closest<HTMLElement>("[data-analysis-stat]");
            if (stat && root.contains(stat)) {
              pulseStat(stat);
              return;
            }
            const score = (e.target as HTMLElement).closest<HTMLElement>("[data-analysis-score]");
            if (score && root.contains(score)) pulseScore(score);
          };

          root.addEventListener("pointerdown", onPointerDown);

          return () => {
            root.removeEventListener("pointerdown", onPointerDown);
          };
        },
      );

      void document.fonts?.ready.then(refresh);
      refresh();

      return () => {
        mm.revert();
      };
    },
    { scope },
  );
}
