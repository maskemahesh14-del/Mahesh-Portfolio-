"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SelectedWork.module.css";
import DecodeText from "./DecodeText";
import HoverUnderline from "./HoverUnderline";
import { TransitionLink, usePixelTransition } from "./PixelTransition";
import { useMagnetic } from "@/hooks/useMagnetic";
import { durations, easings, toSeconds } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type WorkEntry = {
  metric: string;
  title: string;
  role: string;
  href: string;
};

/** Metric-led: each exists to prove a design decision moved a real number. */
const CASE_STUDIES: WorkEntry[] = [
  {
    metric: "₹89L program revenue · +41% cross-category",
    title: "Retention email & WhatsApp design",
    role: "Email + WhatsApp creative across 8 lifecycle flows, 3 D2C brands.",
    href: "/work/retention-email",
  },
  {
    metric: "Category-leading on 3 B2B heuristics no competitor wins",
    title: "Full-stack UX redesign",
    role: "Research to interface for a B2B industrial supplier.",
    href: "/work/ux",
  },
];

/**
 * Deliberately not a WorkEntry: Stash is self-initiated, so it has no business
 * metric to lead with. Dressing it like the case studies would imply one.
 */
const STASH = {
  title: "Stash",
  role: "A self-initiated brand, built end to end: identity, packaging, trailer, voice and lifecycle creative.",
  scope: ["identity", "packaging", "trailer", "voice", "lifecycle"],
  href: "/stash",
};

/**
 * Both card shapes morph into their destination; every other link in the site
 * keeps the plain pixel dissolve. Modified clicks fall through to the browser
 * so open-in-new-tab still works.
 */
function useMorphClick(href: string, title: string) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { navigate } = usePixelTransition();

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      const rect = ref.current?.getBoundingClientRect();
      navigate(
        href,
        rect
          ? {
              rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              },
              title,
            }
          : undefined,
      );
    },
    [href, title, navigate],
  );

  return { ref, onClick };
}

/**
 * Plain pixel dissolve, same as every other link on the site — not the morph
 * StashBanner uses. Case studies used to morph too, but that read as a
 * different transition entirely rather than a variant of the same one.
 */
function WorkCard({ entry, index }: { entry: WorkEntry; index: number }) {
  // Magnetic lives on the arrow, not the card: useMagnetic scales pull by
  // element size, so a full-width card would fling hundreds of px.
  const arrowRef = useRef<HTMLSpanElement>(null);
  useMagnetic(arrowRef);

  return (
    <li className={styles.item} data-work-card>
      <TransitionLink href={entry.href} className={styles.card}>
        <span className={styles.index}>
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className={styles.content}>
          <span className={styles.metric}>
            <DecodeText text={entry.metric} mode="enter" />
          </span>
          <span className={styles.title}>
            <HoverUnderline>
              <DecodeText text={entry.title} mode="enter" />
            </HoverUnderline>
          </span>
          <span className={styles.role}>{entry.role}</span>
        </span>

        <span ref={arrowRef} className={styles.arrow} aria-hidden="true">
          →
        </span>
      </TransitionLink>
    </li>
  );
}

/**
 * Wider and image-forward, with no metric line — it should read as "the
 * creative showcase", not "a third case study".
 */
function StashBanner() {
  const arrowRef = useRef<HTMLSpanElement>(null);
  useMagnetic(arrowRef);
  const { ref, onClick } = useMorphClick(STASH.href, STASH.title);

  return (
    <div data-work-card>
      <Link
        ref={ref}
        href={STASH.href}
        className={styles.stashCard}
        onClick={onClick}
      >
        {/* Quotes Stash's own per-SKU palette — the one visual cue that this
            is a brand, not a metric. */}
        <span className={styles.stashSwatch} aria-hidden="true" />

        <span className={styles.stashBody}>
          <span className={styles.stashTitle}>
            <HoverUnderline>
              <DecodeText text={STASH.title} mode="enter" />
            </HoverUnderline>
          </span>
          <span className={styles.stashRole}>{STASH.role}</span>
          <span className={styles.stashScope}>
            {STASH.scope.map((item) => (
              <span key={item} className={styles.stashChip}>
                {item}
              </span>
            ))}
          </span>
        </span>

        <span ref={arrowRef} className={styles.stashArrow} aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}

export default function SelectedWork() {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    // Reduced motion gets no tween at all — cards stay at their CSS resting
    // state (visible), so nothing needs undoing.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll<HTMLElement>("[data-work-card]").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: toSeconds(durations.scene),
            ease: easings.expoOut.gsap,
            scrollTrigger: { trigger: card, start: "top 85%", once: true },
          },
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} id="work" className={styles.wrapper}>
      <section className={styles.block} aria-labelledby="case-studies-heading">
        <h2 id="case-studies-heading" className={styles.heading}>
          <DecodeText text="CASE STUDIES" mode="enter" />
        </h2>
        <ul className={styles.list}>
          {CASE_STUDIES.map((entry, i) => (
            <WorkCard key={entry.href} entry={entry} index={i} />
          ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby="stash-heading">
        <h2 id="stash-heading" className={styles.heading}>
          <DecodeText text="SELF-INITIATED" mode="enter" />
        </h2>
        <StashBanner />
      </section>
    </div>
  );
}
