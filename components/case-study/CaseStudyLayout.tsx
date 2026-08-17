import type { ReactNode } from "react";
import styles from "./CaseStudyLayout.module.css";
import HoverUnderline from "@/components/HoverUnderline";
import { TransitionLink } from "@/components/PixelTransition";

/** Page shell: reading-width column plus the closing back link. */
export default function CaseStudyLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        {children}
        <footer className={styles.footer}>
          <TransitionLink href="/" className={styles.back}>
            <HoverUnderline>← BACK TO WORK</HoverUnderline>
          </TransitionLink>
        </footer>
      </div>
    </main>
  );
}
