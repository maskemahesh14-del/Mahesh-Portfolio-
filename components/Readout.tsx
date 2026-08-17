"use client";

import styles from "./Readout.module.css";
import { useIdle, useReadout } from "./IdleProvider";

export default function Readout() {
  const { enabled } = useIdle();
  const count = useReadout();

  return (
    <p className={styles.readout} aria-hidden="true">
      {`// ${String(enabled ? count : 0).padStart(3, "0")}`}
    </p>
  );
}
