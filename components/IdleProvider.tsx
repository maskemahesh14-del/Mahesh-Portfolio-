"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { useLenis } from "./SmoothScrollProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Seconds of no input before attract mode engages. */
const IDLE_DELAY = 13;
/** Seconds for attract intensity to ramp in/out. */
const RAMP_IN = 2.2;
const RAMP_OUT = 0.45;

/** Grain re-jitters at this rate — stepped, not per-frame, for a filmic feel. */
const GRAIN_HZ = 12;
const GRAIN_RANGE = 36;
/** Scanline drift, px/sec. Slow on purpose: this should never read as strobing. */
const SCANLINE_SPEED = 1.5;
const SCANLINE_PERIOD = 4;
/** Accent pulse frequency during attract, Hz. */
const PULSE_HZ = 0.32;

/** Auto-scrub demo: fraction of viewport height to drift through, and beat lengths. */
const DEMO_TRAVEL = 0.3;
const DEMO_WAIT = 1.6;
const DEMO_OUT = 3.6;
const DEMO_HOLD = 1.4;
const DEMO_BACK = 2.8;
const DEMO_RESET = 1.8;
/** Only auto-scrub if the reader is parked at the top of the page. */
const DEMO_TOP_THRESHOLD = 40;

type AutoPhase = "off" | "wait" | "out" | "hold" | "back" | "reset";
type ActivityKind = "pointer" | "scrollish";

type IdleState = {
  /** True while attract mode is engaged. */
  idle: boolean;
  /** False under reduced motion — ambient and attract are both disabled. */
  enabled: boolean;
};

const IdleContext = createContext<IdleState>({ idle: false, enabled: false });
/** Separate context: ticks at 1Hz, so only the readout re-renders. */
const ReadoutContext = createContext(0);

export function useIdle() {
  return useContext(IdleContext);
}

export function useReadout() {
  return useContext(ReadoutContext);
}

function resolveIdleDelay() {
  if (process.env.NODE_ENV !== "development") return IDLE_DELAY;
  const param = new URLSearchParams(window.location.search).get("idle");
  const parsed = param === null ? NaN : Number(param);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : IDLE_DELAY;
}

export default function IdleProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useLenis();
  const [idle, setIdle] = useState(false);
  const [readout, setReadout] = useState(0);

  const enabled = !reduced;

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    const idleDelay = resolveIdleDelay();

    let now = 0;
    let lastActivityAt = 0;
    let primed = false;
    let attract = 0;
    let isIdle = false;

    let grainNextAt = 0;
    let grainX = 0;
    let grainY = 0;
    let readoutNextAt = 0;
    let readoutValue = 0;

    let autoPhase: AutoPhase = "off";
    let autoPhaseAt = 0;
    let autoScrolling = false;

    function stopAutoScrub(settleBack: boolean) {
      const wasRunning = autoPhase !== "off";
      autoPhase = "off";
      if (!wasRunning) return;

      const lenis = lenisRef.current;
      // Only reclaim scroll position if the reader hasn't taken over themselves.
      if (settleBack && lenis && window.scrollY > 0) {
        autoScrolling = true;
        lenis.scrollTo(0, {
          duration: 0.7,
          force: true,
          onComplete: () => {
            autoScrolling = false;
          },
        });
      } else {
        autoScrolling = false;
      }
    }

    function enterIdle() {
      isIdle = true;
      setIdle(true);
      root.dataset.idle = "true";
      if (window.scrollY < DEMO_TOP_THRESHOLD) {
        autoPhase = "wait";
        autoPhaseAt = now;
      }
    }

    function exitIdle(kind: ActivityKind) {
      isIdle = false;
      setIdle(false);
      delete root.dataset.idle;
      // A pointer nudge shouldn't strand the page mid-demo; a real scroll gesture
      // means the reader is driving, so hand the scroll position straight over.
      stopAutoScrub(kind === "pointer");
    }

    function markActivity(kind: ActivityKind) {
      lastActivityAt = now;
      if (isIdle) exitIdle(kind);
    }

    function onPointer() {
      markActivity("pointer");
    }
    function onScrollish() {
      markActivity("scrollish");
    }
    function onScroll() {
      // Our own demo scroll must not count as the reader waking up.
      if (autoScrolling) return;
      markActivity("scrollish");
    }

    function advanceAutoScrub() {
      const lenis = lenisRef.current;
      if (!lenis || autoPhase === "off") return;
      const elapsed = now - autoPhaseAt;

      if (autoPhase === "wait" && elapsed >= DEMO_WAIT) {
        autoPhase = "out";
        autoPhaseAt = now;
        autoScrolling = true;
        lenis.scrollTo(window.innerHeight * DEMO_TRAVEL, {
          duration: DEMO_OUT,
          force: true,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      } else if (autoPhase === "out" && elapsed >= DEMO_OUT) {
        autoPhase = "hold";
        autoPhaseAt = now;
      } else if (autoPhase === "hold" && elapsed >= DEMO_HOLD) {
        autoPhase = "back";
        autoPhaseAt = now;
        lenis.scrollTo(0, {
          duration: DEMO_BACK,
          force: true,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      } else if (autoPhase === "back" && elapsed >= DEMO_BACK) {
        autoPhase = "reset";
        autoPhaseAt = now;
        autoScrolling = false;
      } else if (autoPhase === "reset" && elapsed >= DEMO_RESET) {
        autoPhase = "wait";
        autoPhaseAt = now;
      }
    }

    function onTick(time: number, deltaTime: number) {
      // Page Visibility guardrail: freeze everything while backgrounded, and
      // don't let hidden time accumulate into a false idle on return.
      if (document.hidden) return;

      now = time;
      if (!primed) {
        primed = true;
        lastActivityAt = time;
        grainNextAt = time;
        readoutNextAt = time;
      }

      const dt = Math.min(deltaTime, 100) / 1000;

      if (!isIdle && now - lastActivityAt >= idleDelay) enterIdle();

      const target = isIdle ? 1 : 0;
      const rate = dt / (isIdle ? RAMP_IN : RAMP_OUT);
      attract += Math.max(-rate, Math.min(rate, target - attract));
      attract = Math.max(0, Math.min(1, attract));

      if (now >= grainNextAt) {
        grainNextAt = now + 1 / GRAIN_HZ;
        grainX = (Math.random() - 0.5) * GRAIN_RANGE;
        grainY = (Math.random() - 0.5) * GRAIN_RANGE;
        root.style.setProperty("--grain-x", `${grainX.toFixed(1)}px`);
        root.style.setProperty("--grain-y", `${grainY.toFixed(1)}px`);
      }

      const scanY = (now * SCANLINE_SPEED) % SCANLINE_PERIOD;
      root.style.setProperty("--scanline-y", `${scanY.toFixed(2)}px`);
      root.style.setProperty("--attract", attract.toFixed(3));

      const pulse = 0.5 + 0.5 * Math.sin(now * Math.PI * 2 * PULSE_HZ);
      root.style.setProperty("--attract-pulse", (pulse * attract).toFixed(3));

      if (now >= readoutNextAt) {
        readoutNextAt = now + 1;
        readoutValue = (readoutValue + 1) % 1000;
        setReadout(readoutValue);
      }

      advanceAutoScrub();
    }

    function onVisibility() {
      if (document.hidden) {
        if (isIdle) exitIdle("scrollish");
        return;
      }
      // Returning to the tab counts as activity — restart the idle countdown.
      lastActivityAt = now;
      grainNextAt = now;
      readoutNextAt = now;
    }

    const passive = { passive: true } as const;
    window.addEventListener("pointermove", onPointer, passive);
    window.addEventListener("pointerdown", onPointer, passive);
    window.addEventListener("wheel", onScrollish, passive);
    window.addEventListener("touchstart", onScrollish, passive);
    window.addEventListener("touchmove", onScrollish, passive);
    window.addEventListener("keydown", onScrollish);
    window.addEventListener("scroll", onScroll, passive);
    document.addEventListener("visibilitychange", onVisibility);
    gsap.ticker.add(onTick);

    if (process.env.NODE_ENV === "development") {
      window.__portfolioIdle = {
        delay: idleDelay,
        enterNow: () => {
          lastActivityAt = now - idleDelay;
        },
        isIdle: () => isIdle,
      };
    }

    return () => {
      gsap.ticker.remove(onTick);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("wheel", onScrollish);
      window.removeEventListener("touchstart", onScrollish);
      window.removeEventListener("touchmove", onScrollish);
      window.removeEventListener("keydown", onScrollish);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      stopAutoScrub(false);
      delete root.dataset.idle;
      root.style.removeProperty("--grain-x");
      root.style.removeProperty("--grain-y");
      root.style.removeProperty("--scanline-y");
      root.style.removeProperty("--attract");
      root.style.removeProperty("--attract-pulse");
      delete window.__portfolioIdle;
    };
  }, [enabled, lenisRef]);

  return (
    <IdleContext.Provider value={{ idle, enabled }}>
      <ReadoutContext.Provider value={readout}>
        {children}
      </ReadoutContext.Provider>
    </IdleContext.Provider>
  );
}

declare global {
  interface Window {
    __portfolioIdle?: {
      delay: number;
      enterNow: () => void;
      isIdle: () => boolean;
    };
  }
}
