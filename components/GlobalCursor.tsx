"use client";

import MagicCursor from "./MagicCursor";
import { useMotionCapable } from "@/hooks/useMotionCapable";

/**
 * Site-wide cursor. Renders MagicCursor as a fixed, full-viewport overlay
 * (pointer-events: none, so it never blocks clicks) and only on fine-pointer,
 * non-reduced-motion devices — touch/coarse-pointer users keep the native cursor.
 */
export default function GlobalCursor() {
  const capable = useMotionCapable();
  if (!capable) return null;

  return (
    <MagicCursor
      label={false}
      fillColor="#EDEDE6"
      enableStretch
      cursorSize={40}
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
    />
  );
}
