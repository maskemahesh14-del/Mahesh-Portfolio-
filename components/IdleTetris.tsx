"use client";

import { useEffect, useState } from "react";
import Tetris from "./Tetris";
import styles from "./IdleTetris.module.css";
import { useIdle } from "./IdleProvider";
import { durations, easings } from "@/lib/motion";

/**
 * Idle-mode screensaver: a self-playing tetris board that takes over the
 * frame once attract mode engages. Mirrors AttractPrompt/GrainOverlay's
 * pattern — bail entirely under reduced motion, otherwise react to `idle`.
 *
 * The board only mounts while idle (its rAF loop is real work, no reason to
 * run it while the reader is active) — `visible` drives the opacity fade,
 * `mounted` trails it by one `durations.scene` so the fade-out has something
 * to animate before the canvas is torn down.
 */
export default function IdleTetris() {
  const { idle, enabled } = useIdle();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    if (idle) {
      setMounted(true);
      // Mount with opacity 0 first, then flip on the next frame so the
      // transition actually has a 0 -> 1 edge to animate.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), durations.scene);
    return () => clearTimeout(timeout);
  }, [idle, enabled]);

  if (!enabled || !mounted) return null;

  return (
    <div
      className={`${styles.stage} ${visible ? styles.visible : ""}`}
      aria-hidden="true"
      style={{
        transitionDuration: `${durations.scene}ms`,
        transitionTimingFunction: easings.expoOut.css,
      }}
    >
      <Tetris
        boardColor="rgba(237, 237, 230, 0.05)"
        colors={["#c6f24e", "#edede6"]}
        movement={5}
        cellSize={34}
        gap={2}
        rounded={6}
        dropSpeed={2}
      />
    </div>
  );
}
