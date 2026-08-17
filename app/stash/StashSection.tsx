"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./StashSection.module.css";
import DecodeText from "@/components/DecodeText";
import { durations, easings, toSeconds } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type StashSectionProps = {
  index: string;
  /** Lowercase on purpose — Stash's voice is deadpan lowercase. */
  heading: string;
  children: ReactNode;
  /** Widen the column for the packaging centrepiece. */
  wide?: boolean;
};

export default function StashSection({
  index,
  heading,
  children,
  wide = false,
}: StashSectionProps) {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    // Same grammar as the case-study sections: one gentle fade per section,
    // and no tween at all under reduced motion (CSS resting state is visible).
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
    <section
      ref={rootRef}
      className={`${styles.section} ${wide ? styles.wide : ""}`}
    >
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
