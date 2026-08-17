"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

declare global {
  interface Window {
    __portfolioDebug?: {
      gsap: typeof gsap;
      ScrollTrigger: typeof ScrollTrigger;
      lenis: Lenis;
    };
  }
}

const LenisContext = createContext<RefObject<Lenis | null>>({ current: null });

/**
 * Ref to the shared Lenis instance (stable identity, populated on mount).
 * Read `.current` at event/effect time — e.g. `useLenis().current?.scrollTo(0)`.
 */
export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      autoRaf: false,
    });

    // ScrollTrigger reads Lenis's smoothed scroll position.
    instance.on("scroll", () => ScrollTrigger.update());

    function onTick(time: number) {
      instance.raf(time * 1000);
    }

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;

    /*
     * Content height changes after mount — route swaps, webfont swap, scroll
     * reveals. If Lenis's cached limit is stale the page stops scrolling part
     * way down, so recompute whenever the document actually gets taller or
     * shorter.
     *
     * Guarded on measured height: ScrollTrigger.refresh() resizes pin-spacers,
     * which itself mutates document height. Without the guard the observer
     * would re-trigger its own cause and loop.
     */
    let lastHeight = document.documentElement.scrollHeight;
    let pending = 0;

    function recompute() {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        const height = document.documentElement.scrollHeight;
        if (height === lastHeight) return;
        lastHeight = height;
        instance.resize();
        ScrollTrigger.refresh();
      });
    }

    const observer = new ResizeObserver(recompute);
    observer.observe(document.body);

    // Webfonts land after first paint and reflow text — re-measure once they do.
    if (document.fonts) {
      document.fonts.ready
        .then(() => {
          lastHeight = -1;
          recompute();
        })
        .catch(() => {});
    }

    if (process.env.NODE_ENV === "development") {
      window.__portfolioDebug = { gsap, ScrollTrigger, lenis: instance };
    }

    return () => {
      cancelAnimationFrame(pending);
      observer.disconnect();
      gsap.ticker.remove(onTick);
      instance.destroy();
      lenisRef.current = null;
      delete window.__portfolioDebug;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
