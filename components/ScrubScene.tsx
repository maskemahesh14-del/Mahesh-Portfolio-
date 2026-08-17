"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type SceneBuild = (
  timeline: gsap.core.Timeline,
  root: HTMLElement,
) => void;

type ScrubSceneProps = {
  /**
   * Populates the scene's timeline. Contract: author the DOM/CSS in the
   * PRE-scroll state and reveal with to()/fromTo() tweens — under
   * prefers-reduced-motion the same timeline is jumped to its end state
   * (no pin, no scrub), so every tween's end values must describe the
   * scene at rest. Keep the reference stable (module scope or useCallback).
   */
  build: SceneBuild;
  /** How long the section stays pinned, in viewport heights of scroll. */
  length?: number;
  /** Scrub catch-up smoothing, in seconds (ScrollTrigger's `scrub`). */
  scrub?: number;
  className?: string;
  children: ReactNode;
};

export default function ScrubScene({
  build,
  length = 1,
  scrub = 1,
  className,
  children,
}: ScrubSceneProps) {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    /*
     * Pin + scrub only on wide, motion-friendly viewports.
     *
     * Narrow screens deliberately take the same path as reduced motion: a
     * pinned, scrub-driven section on touch is the classic scroll trap — a
     * flick gesture can leave the reader stuck inside a section that eats
     * their scroll. The static end state shows exactly the same content.
     * The two queries are mutually exclusive and together cover every case.
     */
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${length * 100}%`,
          pin: true,
          scrub,
          anticipatePin: 1,
        },
      });
      build(timeline, root);
    });

    // Reduced motion or narrow: no pin, no scrub — render the end state.
    mm.add("(prefers-reduced-motion: reduce), (max-width: 767px)", () => {
      const timeline = gsap.timeline({ paused: true });
      build(timeline, root);
      timeline.progress(1);

      /*
       * Re-assert on the next frame. This runs in a layout effect, but
       * imperative children (DecodeText, DrawLine) paint their resting state
       * from a passive effect, which fires afterwards and would stomp the end
       * state back to progress 0 — leaving scrambled filler text and undrawn
       * rules on any viewport that isn't also reduced-motion.
       */
      const frame = requestAnimationFrame(() => {
        // Through 0 first: those children mutate the DOM directly, so GSAP
        // still believes it is at progress 1 and would skip a redundant
        // re-render, leaving the stomped state on screen.
        timeline.progress(0).progress(1);
      });
      return () => cancelAnimationFrame(frame);
    });

    return () => mm.revert();
  }, [build, length, scrub]);

  return (
    <section ref={rootRef} className={className}>
      {children}
    </section>
  );
}
