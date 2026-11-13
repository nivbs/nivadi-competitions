"use client";

import { useEffect, useRef } from "react";

const SRC = "/audio/champions.mp3";
/** Jump to the chorus — “We are the champions…”. */
const START_AT_SEC = 31.5;
const FADE_SEC = 1;
const TARGET_GAIN = 0.85;

/**
 * Plays the champions clip while the winner sheet is open (crown buttons).
 * Fades in over 1s from {@link START_AT_SEC}. Stops when `active` becomes false or on unmount.
 */
export function useChampionsAnthem(active: boolean) {
  const teardownRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active) {
      teardownRef.current?.();
      teardownRef.current = null;
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    const audio = new Audio(SRC);
    audio.preload = "auto";
    audio.loop = true;

    let ctx: AudioContext | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    let gain: GainNode | null = null;

    const stop = () => {
      cancelled = true;
      audio.pause();
      try {
        audio.currentTime = START_AT_SEC;
      } catch {
        /* seek may fail if metadata not loaded */
      }
      try {
        source?.disconnect();
        gain?.disconnect();
      } catch {
        /* already torn down */
      }
      void ctx?.close();
      ctx = null;
      source = null;
      gain = null;
    };

    const run = async () => {
      try {
        ctx = new AudioContext();
        gain = ctx.createGain();
        gain.gain.value = 0;
        source = ctx.createMediaElementSource(audio);
        source.connect(gain).connect(ctx.destination);

        const seekToStart = () => {
          if (cancelled) return;
          audio.currentTime = START_AT_SEC;
        };
        if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
          seekToStart();
        } else {
          audio.addEventListener("loadedmetadata", seekToStart, { once: true });
        }

        await audio.play();
        if (cancelled) return;

        if (ctx.state === "suspended") await ctx.resume();

        const t0 = ctx.currentTime;
        gain.gain.cancelScheduledValues(t0);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(TARGET_GAIN, t0 + FADE_SEC);
      } catch {
        stop();
      }
    };

    void run();

    teardownRef.current = stop;

    return () => {
      stop();
      teardownRef.current = null;
    };
  }, [active]);
}
