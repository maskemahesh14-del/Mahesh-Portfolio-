import type { ReactNode } from "react";
import styles from "./MetricCallout.module.css";
import DecodeText from "@/components/DecodeText";

/** Grid wrapper for two or more callouts. */
export function MetricRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

type MetricCalloutProps = {
  /** The number itself, e.g. "5/5". Kept short — it decodes on enter. */
  value: string;
  label: string;
};

export default function MetricCallout({ value, label }: MetricCalloutProps) {
  return (
    <div className={styles.callout}>
      <p className={styles.value}>
        <DecodeText text={value} mode="enter" />
      </p>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
