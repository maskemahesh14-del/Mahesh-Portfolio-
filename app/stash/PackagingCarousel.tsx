"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "./PackagingCarousel.module.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Intrinsic size of the optimized renders in public/stash/products. */
const SHOT_W = 1400;
const SHOT_H = 792;

export type CarouselSku = {
  name: string;
  grain: string;
  /** Filename stem: `${slug}-bag.webp` / `${slug}-multipack.webp`. */
  slug: string;
  /** The SKU's secondary colour token, same one the SKU list above uses. */
  color: string;
  /** One or two lines on what the grain actually is. */
  description: string;
};

/**
 * The packaging centrepiece: one SKU at a time, with a peek of the next.
 *
 * Native scroll-snap does the work — no carousel library for four slides. The
 * buttons just call scrollTo, so touch swipe, trackpad and the controls all
 * drive the same scroll position and can't disagree about which slide is up.
 *
 * StashSection already fades this section in, so there's no entrance here.
 */
export default function PackagingCarousel({ skus }: { skus: CarouselSku[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  /*
   * Active slide is derived from scroll position rather than tracked
   * separately, so a swipe and a button press stay in sync by construction.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;

    function measure() {
      const el = trackRef.current;
      if (!el) return;

      const slides = Array.from(el.children) as HTMLElement[];
      if (!slides.length) return;

      const centre = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let nearestGap = Infinity;

      slides.forEach((slide, index) => {
        const gap = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - centre);
        if (gap < nearestGap) {
          nearestGap = gap;
          nearest = index;
        }
      });

      setActive(nearest);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const go = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;

      const target = Math.max(0, Math.min(index, track.children.length - 1));
      const slide = track.children[target] as HTMLElement | undefined;
      if (!slide) return;

      // Centre the slide, matching scroll-snap-align: center.
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced],
  );

  return (
    <div
      className={styles.carousel}
      role="group"
      aria-roledescription="carousel"
      aria-label="Packaging renders, one SKU per slide"
    >
      {/*
       * data-lenis-prevent-horizontal, not data-lenis-prevent: the narrower
       * attribute hands Lenis back every vertical gesture, so the page still
       * scrolls normally while the pointer is over the carousel.
       */}
      <ul className={styles.track} ref={trackRef} data-lenis-prevent-horizontal>
        {skus.map((sku, index) => (
          <li
            key={sku.slug}
            className={styles.slide}
            style={{ "--sku": sku.color } as CSSProperties}
            aria-roledescription="slide"
            aria-label={`${sku.name}, ${index + 1} of ${skus.length}`}
          >
            {/* Echoes .skuSwatch in the SKU list above rather than introducing
                a second colour language for the same product. */}
            <span className={styles.swatch} aria-hidden="true" />

            <div className={styles.stage}>
              <figure className={`${styles.shot} ${styles.shotBag}`}>
                <Image
                  src={`/stash/products/${sku.slug}-bag.webp`}
                  alt={`${sku.name} single-serve pack, front on`}
                  width={SHOT_W}
                  height={SHOT_H}
                  sizes="(max-width: 48rem) 55vw, 32vw"
                  className={styles.image}
                />
                <figcaption className={styles.shotLabel}>bag</figcaption>
              </figure>

              <figure className={`${styles.shot} ${styles.shotMulti}`}>
                <Image
                  src={`/stash/products/${sku.slug}-multipack.webp`}
                  alt={`${sku.name} multipack carton`}
                  width={SHOT_W}
                  height={SHOT_H}
                  sizes="(max-width: 48rem) 40vw, 22vw"
                  className={styles.image}
                />
                <figcaption className={styles.shotLabel}>multipack</figcaption>
              </figure>
            </div>

            <div className={styles.meta}>
              <p className={styles.name}>
                {sku.name}
                <span className={styles.grain}>, {sku.grain}</span>
              </p>
              <p className={styles.description}>{sku.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => go(active - 1)}
          disabled={active === 0}
          aria-label="Previous SKU"
        >
          ←
        </button>

        <ul className={styles.dots}>
          {skus.map((sku, index) => (
            <li key={sku.slug}>
              <button
                type="button"
                className={styles.dot}
                style={{ "--sku": sku.color } as CSSProperties}
                data-active={index === active ? "true" : "false"}
                onClick={() => go(index)}
                aria-label={`Show ${sku.name}`}
                aria-current={index === active ? "true" : undefined}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => go(active + 1)}
          disabled={active === skus.length - 1}
          aria-label="Next SKU"
        >
          →
        </button>

        {/* Announces the change for screen readers; the dots carry it visually. */}
        <p className={styles.counter} aria-live="polite">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(skus.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
