"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import styles from "./DecodeText.module.css";
import { durations, easings, toSeconds } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const GLYPH_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+=-_/\\|<>[]{}";
const FILLER_CHAR = "_";
const FLICKER_STEPS = 8;
/** Reveal sweep covers the first 75% of progress, leaving a settled tail. */
const REVEAL_SPAN = 0.75;
/** How long (in progress units) each character flickers before locking in. */
const FLICKER_WINDOW = 0.18;
const ENTER_THRESHOLD = 0.6;

export type DecodeTextHandle = {
  /** 0 = fully scrambled, 1 = fully resolved. Pure function of progress — scrub-safe both directions. */
  setProgress: (progress: number) => void;
};

type DecodeTextProps = {
  text: string;
  /**
   * 'enter' (default): self-driven — plays once when scrolled into view.
   * 'scrub': progress is externally controlled — feed it from a ScrubScene
   * timeline via this component's ref (`ref.current.setProgress(p)`).
   */
  mode?: "enter" | "scrub";
  as?: "span" | "div";
  className?: string;
};

function randomGlyph() {
  return GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)];
}

const DecodeText = forwardRef<DecodeTextHandle, DecodeTextProps>(
  function DecodeText({ text, mode = "enter", as = "span", className }, ref) {
    const reduced = usePrefersReducedMotion();
    const reducedRef = useRef(reduced);
    const visualRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      reducedRef.current = reduced;
    }, [reduced]);

    // Only non-space characters occupy a reveal slot — scrambling a space
    // reads as broken, not retro.
    const revealIndices = useMemo(
      () =>
        [...text].reduce<number[]>((acc, ch, i) => {
          if (ch !== " ") acc.push(i);
          return acc;
        }, []),
      [text],
    );

    // Precomputed once per mount/text so scrubbing the same progress value
    // (forward or backward) always renders the identical glyph.
    const flickerGlyphs = useMemo(
      () =>
        revealIndices.map(() =>
          Array.from({ length: FLICKER_STEPS }, randomGlyph),
        ),
      [revealIndices],
    );

    const applyProgress = useCallback(
      (progress: number) => {
        const el = visualRef.current;
        if (!el) return;

        if (reducedRef.current || revealIndices.length === 0) {
          el.textContent = text;
          return;
        }

        const clamped = Math.max(0, Math.min(1, progress));
        const chars = text.split("");
        const denom = Math.max(revealIndices.length - 1, 1);

        revealIndices.forEach((charIndex, k) => {
          const revealAt = (k / denom) * REVEAL_SPAN;
          if (clamped <= revealAt) {
            chars[charIndex] = FILLER_CHAR;
          } else if (clamped >= revealAt + FLICKER_WINDOW) {
            chars[charIndex] = text[charIndex];
          } else {
            const local = (clamped - revealAt) / FLICKER_WINDOW;
            const steps = flickerGlyphs[k];
            chars[charIndex] =
              steps[Math.min(steps.length - 1, Math.floor(local * steps.length))];
          }
        });

        el.textContent = chars.join("");
      },
      [text, revealIndices, flickerGlyphs],
    );

    useImperativeHandle(ref, () => ({ setProgress: applyProgress }), [
      applyProgress,
    ]);

    // Resting paint: filler at rest, or final text under reduced motion —
    // re-fires if reduced motion is toggled live, so it self-corrects
    // regardless of the hook's async initial read.
    useEffect(() => {
      applyProgress(reduced ? 1 : 0);
    }, [reduced, applyProgress]);

    useEffect(() => {
      if (mode !== "enter" || reduced) return;
      const el = visualRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          const proxy = { value: 0 };
          gsap.to(proxy, {
            value: 1,
            duration: toSeconds(durations.scene),
            ease: easings.expoOut.gsap,
            onUpdate: () => applyProgress(proxy.value),
          });
        },
        { threshold: ENTER_THRESHOLD },
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [mode, reduced, applyProgress]);

    const Tag = as;

    return (
      <Tag className={className}>
        <span ref={visualRef} className={styles.visual} aria-hidden="true" />
        <span className={styles.srOnly}>{text}</span>
      </Tag>
    );
  },
);

export default DecodeText;
