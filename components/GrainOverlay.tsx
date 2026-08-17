"use client";

import styles from "./GrainOverlay.module.css";
import { useIdle } from "./IdleProvider";

export default function GrainOverlay() {
  const { enabled } = useIdle();
  if (!enabled) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.grain} />
      <div className={styles.scanlines} />
      <div className={styles.pulse} />
    </div>
  );
}
