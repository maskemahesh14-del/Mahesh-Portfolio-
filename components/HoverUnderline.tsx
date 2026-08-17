import type { ReactNode } from "react";
import styles from "./HoverUnderline.module.css";
import { durations, easings } from "@/lib/motion";

export default function HoverUnderline({ children }: { children: ReactNode }) {
  return (
    <span
      className={styles.root}
      style={{
        transitionDuration: `${durations.hover}ms`,
        transitionTimingFunction: easings.expoOut.css,
      }}
    >
      {children}
      <span
        className={styles.underline}
        aria-hidden="true"
        style={{
          transitionDuration: `${durations.element}ms`,
          transitionTimingFunction: easings.expoOut.css,
        }}
      />
    </span>
  );
}
