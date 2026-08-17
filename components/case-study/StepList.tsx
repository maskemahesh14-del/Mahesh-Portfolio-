import type { ReactNode } from "react";
import styles from "./StepList.module.css";

export type Step = {
  title: string;
  body: ReactNode;
};

type StepListProps = {
  steps: Step[];
  /** Numbered by default; pass false for an unnumbered feature list. */
  ordered?: boolean;
};

/**
 * Bold-led items with an optional number rail. Fits any "N structural
 * moves" / "N-rung ladder" shape, so both case studies can share it.
 */
export default function StepList({ steps, ordered = true }: StepListProps) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag className={styles.list}>
      {steps.map((step, i) => (
        <li key={step.title} className={styles.item}>
          <span className={styles.marker} aria-hidden="true">
            {ordered ? String(i + 1).padStart(2, "0") : "—"}
          </span>
          <div className={styles.content}>
            <h3 className={styles.title}>{step.title}</h3>
            <div className={styles.body}>{step.body}</div>
          </div>
        </li>
      ))}
    </Tag>
  );
}
