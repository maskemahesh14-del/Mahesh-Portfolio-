"use client";

import { useEffect, useRef } from "react";
import styles from "./TrollOverlay.module.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export const TROLL_LINES = [
  "you lost. to a portfolio website.",
  "skill issue.",
  "i'm literally javascript and i still won.",
  "rigged? no. you're just unlucky.",
  "cope. roll again.",
] as const;

/** Avoids repeating the same line twice in a row so it doesn't feel canned. */
export function pickTrollLine(exclude?: string): string {
  if (TROLL_LINES.length <= 1) return TROLL_LINES[0];
  let line: string = TROLL_LINES[Math.floor(Math.random() * TROLL_LINES.length)];
  while (line === exclude) {
    line = TROLL_LINES[Math.floor(Math.random() * TROLL_LINES.length)];
  }
  return line;
}

type TrollOverlayProps = {
  line: string;
  onDismiss: () => void;
};

/**
 * Full-screen takeover on a loss. A plain fixed-position sibling — same
 * pattern PixelTransition's canvas already uses — not a portal, since nothing
 * in the ancestor chain sets a transform that would break `position: fixed`.
 */
export default function TrollOverlay({ line, onDismiss }: TrollOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      className={styles.overlay}
      data-reduced={reduced ? "true" : "false"}
      role="alertdialog"
      aria-modal="true"
      aria-label="You lost the round"
    >
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.sweep} aria-hidden="true" />
      <p className={styles.line} data-text={line}>
        {line}
      </p>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        onClick={onDismiss}
      >
        run it back
      </button>
    </div>
  );
}
