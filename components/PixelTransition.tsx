"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createDissolveRenderer } from "@/lib/pixelDissolve";
import type { DissolveRenderer } from "@/lib/pixelDissolve";
import { durations, easings, toSeconds } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLenis } from "./SmoothScrollProvider";
import styles from "./PixelTransition.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Phase = "idle" | "cover" | "covered" | "reveal";

/** Cover and reveal each take half the scene token → ~800ms total. */
const PHASE_DURATION = toSeconds(durations.scene) / 2;
/** Beat under full cover letting the new route paint before revealing. */
const PAINT_SETTLE = 0.1;
/** If the navigation never commits, reveal anyway rather than strand the user. */
const COMMIT_TIMEOUT = 4;
/** Dissolve block size, CSS px. Exported so the hero loader's dissolve
 *  stays visually identical to the route transition's. */
export const BLOCK_PX = 28;

/**
 * Where the morphing title lands. Approximates the case-study headline slot
 * rather than measuring it — the destination hasn't mounted yet at this point,
 * and the title cross-fades out before the real headline shows, so a close
 * approximation reads correctly without coupling to the page's internals.
 */
const MORPH_TITLE_X = 48;
const MORPH_TITLE_Y_RATIO = 0.4;
const MORPH_TITLE_SCALE = 1.6;

let webglSupport: boolean | null = null;
function supportsWebgl() {
  if (webglSupport === null) {
    try {
      webglSupport = Boolean(
        document.createElement("canvas").getContext("webgl"),
      );
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/**
 * A work card hands over its on-screen rect and title so the transition can
 * expand that card into the incoming page instead of dissolving.
 *
 * Deliberately NOT Framer Motion's layoutId: that needs the same element
 * identity to survive the route swap, and App Router unmounts the outgoing
 * page. A snapshot rendered in the persistent shell can't be torn down
 * mid-flight, so it survives whatever the router does.
 */
export type MorphSource = {
  rect: { top: number; left: number; width: number; height: number };
  title: string;
};

type Mode = "pixel" | "morph";

const TransitionContext = createContext<{
  navigate: (href: string, morph?: MorphSource) => void;
  active: boolean;
}>({ navigate: () => {}, active: false });

export function usePixelTransition() {
  return useContext(TransitionContext);
}

type TransitionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Link that routes through the pixel transition on plain left-clicks and
 *  keeps native behavior (new tab, etc.) for modified clicks. */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, className, children }, ref) {
    const { navigate } = usePixelTransition();

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
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
      navigate(href);
    }

    return (
      <Link ref={ref} href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  },
);

export default function PixelTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const lenisRef = useLenis();

  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<Mode>("pixel");
  const [morph, setMorph] = useState<MorphSource | null>(null);
  const morphPanelRef = useRef<HTMLDivElement>(null);
  const morphTitleRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DissolveRenderer | null>(null);
  const progressRef = useRef({ value: 0 });
  const seedRef = useRef(1);
  const targetRef = useRef<string | null>(null);
  /** Dev-only: freezes the state machine so a static progress can be inspected. */
  const holdRef = useRef(false);

  const active = phase !== "idle";

  const renderFrame = useCallback(() => {
    rendererRef.current?.render(progressRef.current.value, seedRef.current);
  }, []);

  const navigate = useCallback(
    (href: string, morphSource?: MorphSource) => {
      if (phase !== "idle" || href === pathname) return;
      // Reduced motion swaps instantly, by policy.
      if (reduced) {
        router.push(href);
        return;
      }
      // The morph is plain DOM, so it still works without WebGL; only the
      // pixel curtain needs to fall back to an instant swap.
      const useMorph = Boolean(morphSource);
      if (!useMorph && !supportsWebgl()) {
        router.push(href);
        return;
      }

      targetRef.current = href;
      if (morphSource) {
        setMode("morph");
        setMorph(morphSource);
      } else {
        setMode("pixel");
        setMorph(null);
        seedRef.current = Math.random() * 100;
        progressRef.current.value = 0;
      }
      lenisRef.current?.stop();
      setPhase("cover");
    },
    [phase, pathname, reduced, router, lenisRef],
  );

  // Canvas + GL lifecycle: exists only while a transition is running.
  // Declared before the phase effects so the renderer is ready when the
  // cover tween's first onUpdate fires.
  useEffect(() => {
    if (!active || mode !== "pixel") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createDissolveRenderer(canvas, { blockPx: BLOCK_PX });
    rendererRef.current = renderer;
    if (renderer) {
      renderer.resize();
      renderer.render(progressRef.current.value, seedRef.current);
    }
    return () => {
      renderer?.dispose();
      rendererRef.current = null;
    };
  }, [active, mode]);

  // Phase: cover — pixels grow until the screen is opaque, then push.
  useEffect(() => {
    if (phase !== "cover" || mode !== "pixel" || holdRef.current) return;
    const tween = gsap.to(progressRef.current, {
      value: 1,
      duration: PHASE_DURATION,
      ease: easings.powerInOut.gsap,
      onUpdate: renderFrame,
      onComplete: () => {
        const target = targetRef.current;
        if (target) router.push(target);
        setPhase("covered");
      },
    });
    return () => {
      tween.kill();
    };
  }, [phase, mode, router, renderFrame]);

  /*
   * Phase: cover (morph) — the clicked card's snapshot expands to fill the
   * viewport while its title travels up to roughly where the case-study
   * headline sits. Transform and opacity only: the panel is laid out at full
   * viewport size and scaled DOWN to the card's rect, so growing it is a pure
   * transform rather than an animated width/height (which would relayout
   * every frame).
   */
  useEffect(() => {
    if (phase !== "cover" || mode !== "morph" || holdRef.current) return;
    const panel = morphPanelRef.current;
    const title = morphTitleRef.current;
    if (!panel || !morph) {
      setPhase("covered");
      return;
    }

    // Starting transform comes from the inline style on the elements, so the
    // tweens only need to describe where they land.
    const timeline = gsap.timeline({
      onComplete: () => {
        const target = targetRef.current;
        if (target) router.push(target);
        setPhase("covered");
      },
    });

    timeline.to(
      panel,
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: PHASE_DURATION,
        ease: easings.powerInOut.gsap,
      },
      0,
    );

    if (title) {
      timeline.to(
        title,
        {
          x: MORPH_TITLE_X,
          y: window.innerHeight * MORPH_TITLE_Y_RATIO,
          scale: MORPH_TITLE_SCALE,
          duration: PHASE_DURATION,
          ease: easings.powerInOut.gsap,
        },
        0,
      );
    }

    return () => {
      timeline.kill();
    };
  }, [phase, mode, morph, router]);

  // Phase: covered — wait for the route to commit, reset scroll beneath the
  // opaque curtain, give the new view a paint beat, then reveal.
  useEffect(() => {
    if (phase !== "covered") return;
    renderFrame();

    if (pathname === targetRef.current) {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });

      /*
       * Measure AFTER the incoming route has laid out and painted. Refreshing
       * synchronously here measures the outgoing page, which leaves Lenis
       * clamped to a stale (usually much shorter) scroll limit — the page then
       * stops scrolling part way down. Two frames: one for React to commit the
       * new tree, one for the browser to lay it out.
       */
      let cancelled = false;
      let frameA = 0;
      let frameB = 0;

      function settle() {
        if (cancelled) return;
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      }

      frameA = requestAnimationFrame(() => {
        frameB = requestAnimationFrame(settle);
      });

      // Webfonts can swap in after the route paints and reflow it taller.
      if (document.fonts) document.fonts.ready.then(settle).catch(() => {});

      const call = gsap.delayedCall(PAINT_SETTLE, () => setPhase("reveal"));
      return () => {
        cancelled = true;
        cancelAnimationFrame(frameA);
        cancelAnimationFrame(frameB);
        call.kill();
      };
    }

    const safety = gsap.delayedCall(COMMIT_TIMEOUT, () => setPhase("reveal"));
    return () => {
      safety.kill();
    };
  }, [phase, pathname, lenisRef, renderFrame]);

  // Phase: reveal (morph) — the title dissolves first so it never appears to
  // snap against the real headline, then the panel fades off the new page.
  useEffect(() => {
    if (phase !== "reveal" || mode !== "morph" || holdRef.current) return;
    const timeline = gsap.timeline({
      onComplete: () => {
        targetRef.current = null;
        setMorph(null);
        setPhase("idle");
      },
    });

    if (morphTitleRef.current) {
      timeline.to(
        morphTitleRef.current,
        { opacity: 0, duration: PHASE_DURATION * 0.45, ease: "none" },
        0,
      );
    }
    if (morphPanelRef.current) {
      timeline.to(
        morphPanelRef.current,
        {
          opacity: 0,
          duration: PHASE_DURATION,
          ease: easings.powerInOut.gsap,
        },
        0,
      );
    }

    return () => {
      timeline.kill();
    };
  }, [phase, mode]);

  // Phase: reveal — new seed, pixels shrink away over the new view.
  useEffect(() => {
    if (phase !== "reveal" || mode !== "pixel" || holdRef.current) return;
    seedRef.current = Math.random() * 100;
    const tween = gsap.to(progressRef.current, {
      value: 0,
      duration: PHASE_DURATION,
      ease: easings.powerInOut.gsap,
      onUpdate: renderFrame,
      onComplete: () => {
        targetRef.current = null;
        lenisRef.current?.start();
        setPhase("idle");
      },
    });
    return () => {
      tween.kill();
    };
  }, [phase, mode, lenisRef, renderFrame]);

  // Whatever happens, never leave Lenis stopped: every route back to idle
  // restarts it, so no failure path (safety timeout, interrupted tween,
  // unmount mid-transition) can strand the page unscrollable.
  useEffect(() => {
    if (phase === "idle") lenisRef.current?.start();
  }, [phase, lenisRef]);

  useEffect(() => {
    const lenis = lenisRef;
    return () => {
      lenis.current?.start();
    };
  }, [lenisRef]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    window.__portfolioTransition = {
      navigate,
      phase: () => phase,
      hold: (progress, seed) => {
        holdRef.current = true;
        if (seed !== undefined) seedRef.current = seed;
        gsap.killTweensOf(progressRef.current);
        progressRef.current.value = progress;
        setPhase("cover");
        // Plain timeout on purpose: dev tooling must work even when rAF is
        // frozen (hidden pane); production code paths never use timers.
        setTimeout(() => {
          progressRef.current.value = progress;
          renderFrame();
        }, 60);
      },
      release: () => {
        holdRef.current = false;
        gsap.killTweensOf(progressRef.current);
        progressRef.current.value = 0;
        lenisRef.current?.start();
        setPhase("idle");
      },
    };
    return () => {
      delete window.__portfolioTransition;
    };
  }, [navigate, phase, renderFrame, lenisRef]);

  return (
    <TransitionContext.Provider value={{ navigate, active }}>
      {children}
      {active && mode === "pixel" && (
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      )}
      {active && mode === "morph" && morph && (
        <>
          {/* Initial transform is inline so the panel is never painted at full
              size for a frame before GSAP takes over. */}
          <div
            ref={morphPanelRef}
            className={styles.morphPanel}
            aria-hidden="true"
            style={{
              transform: `translate(${morph.rect.left}px, ${morph.rect.top}px) scale(${
                morph.rect.width / window.innerWidth
              }, ${morph.rect.height / window.innerHeight})`,
            }}
          />
          <span
            ref={morphTitleRef}
            className={styles.morphTitle}
            aria-hidden="true"
            style={{
              transform: `translate(${morph.rect.left}px, ${
                morph.rect.top + morph.rect.height / 2
              }px) scale(1)`,
            }}
          >
            {morph.title}
          </span>
        </>
      )}
    </TransitionContext.Provider>
  );
}

declare global {
  interface Window {
    __portfolioTransition?: {
      navigate: (href: string) => void;
      phase: () => Phase;
      hold: (progress: number, seed?: number) => void;
      release: () => void;
    };
  }
}
