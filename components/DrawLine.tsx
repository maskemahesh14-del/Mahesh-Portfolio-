"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import gsap from "gsap";
import { durations, easings, toSeconds } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const ENTER_THRESHOLD = 0.6;

export type DrawLineHandle = {
  /** 0 = undrawn, 1 = fully drawn. Pure function of progress — scrub-safe both directions. */
  setProgress: (progress: number) => void;
};

type DrawLineProps = {
  /** SVG path data, in its own local viewBox coordinate space. */
  d: string;
  viewBox: string;
  /**
   * 'enter' (default): self-driven — draws once when scrolled into view.
   * 'scrub': progress is externally controlled — feed it from a ScrubScene
   * timeline via this component's ref (`ref.current.setProgress(p)`).
   */
  mode?: "enter" | "scrub";
  className?: string;
  strokeWidth?: number;
};

const DrawLine = forwardRef<DrawLineHandle, DrawLineProps>(function DrawLine(
  { d, viewBox, mode = "enter", className, strokeWidth = 2 },
  ref,
) {
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const applyProgress = useCallback((progress: number) => {
    const path = pathRef.current;
    if (!path) return;
    const p = reducedRef.current ? 1 : Math.max(0, Math.min(1, progress));
    path.style.strokeDashoffset = String(1 - p);
  }, []);

  useImperativeHandle(ref, () => ({ setProgress: applyProgress }), [
    applyProgress,
  ]);

  useEffect(() => {
    applyProgress(reduced ? 1 : 0);
  }, [reduced, applyProgress]);

  useEffect(() => {
    if (mode !== "enter" || reduced) return;
    const path = pathRef.current;
    if (!path) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const proxy = { value: 0 };
        gsap.to(proxy, {
          value: 1,
          duration: toSeconds(durations.scene),
          ease: easings.powerInOut.gsap,
          onUpdate: () => applyProgress(proxy.value),
        });
      },
      { threshold: ENTER_THRESHOLD },
    );

    observer.observe(path);
    return () => observer.disconnect();
  }, [mode, reduced, applyProgress]);

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d={d}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
      />
    </svg>
  );
});

export default DrawLine;
