"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CaseStudySection.module.css";
import DecodeText from "@/components/DecodeText";
import DrawLine from "@/components/DrawLine";
import { durations, easings, toSeconds } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type CaseStudySectionProps = {
  /** Two-digit rail marker, e.g. "01". */
  index: string;
  heading: string;
  children: ReactNode;
};

/**
 * One case-study chapter: a drawn rule, an indexed heading that decodes on
 * enter, and prose. Deliberately un-pinned — case studies are for reading,
 * so nothing traps the scroll on any viewport.
 */
export default function CaseStudySection({
  index,
  heading,
  children,
}: CaseStudySectionProps) {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    // One gentle fade per section, not per paragraph — body copy stays
    // readable. Reduced motion adds no tween at all, so the CSS resting
    // state (visible) already is the end state.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        root,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: toSeconds(durations.scene),
          ease: easings.expoOut.gsap,
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} className={styles.section}>
      <DrawLine
        mode="enter"
        d="M0 1 L100 1"
        viewBox="0 0 100 2"
        strokeWidth={1}
        className={styles.rule}
      />
      <div className={styles.head}>
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
        <h2 className={styles.heading}>
          <DecodeText text={heading} mode="enter" />
        </h2>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
