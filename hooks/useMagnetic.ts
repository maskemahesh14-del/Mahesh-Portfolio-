"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { durations, easings, toSeconds } from "@/lib/motion";
import { useMotionCapable } from "./useMotionCapable";

const REACH = 60;
const PULL_STRENGTH = 0.35;

export function useMagnetic<T extends HTMLElement>(ref: RefObject<T | null>) {
  const capable = useMotionCapable();

  useEffect(() => {
    const el = ref.current;
    if (!capable || !el) return;

    let active = false;

    function handlePointerMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const reach = Math.max(rect.width, rect.height) / 2 + REACH;

      if (distance < reach) {
        active = true;
        gsap.to(el, {
          x: dx * PULL_STRENGTH,
          y: dy * PULL_STRENGTH,
          duration: toSeconds(durations.element),
          ease: easings.expoOut.gsap,
          overwrite: true,
        });
      } else if (active) {
        active = false;
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: toSeconds(durations.element),
          ease: easings.backOut.gsap,
          overwrite: true,
        });
      }
    }

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [capable, ref]);
}
