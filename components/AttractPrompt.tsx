"use client";

import styles from "./AttractPrompt.module.css";
import { useIdle } from "./IdleProvider";
import { durations, easings } from "@/lib/motion";

export default function AttractPrompt() {
  const { idle, enabled } = useIdle();
  if (!enabled) return null;

  return (
    <p
      className={`${styles.prompt} ${idle ? styles.visible : ""}`}
      aria-hidden="true"
      style={{
        transitionDuration: `${durations.scene}ms`,
        transitionTimingFunction: easings.expoOut.css,
      }}
    >
      {"// idle: move to continue"}
    </p>
  );
}
