"use client";

import * as React from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

type Direction = "up" | "down" | "left" | "right";

type Props = {
  children: React.ReactNode;
  /** Pixel cell size in px. Smaller = finer grid. */
  gridSize?: number;
  /** Raggedness of the dissolving frontier, 0–100. */
  edgeHeight?: number;
  /** Colour of the covering pixels — match the section's background. */
  coverColor?: string;
  /** Reveal duration in seconds. */
  duration?: number;
  /** Sweep direction. "up" = reveals bottom-to-top. */
  direction?: Direction;
  className?: string;
  style?: React.CSSProperties;
};

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export default function PixelRevealSection({
  children,
  gridSize = 14,
  edgeHeight = 14,
  coverColor = "#0E0E0C",
  duration = 1.1,
  direction = "up",
  className,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // 1 = fully revealed (canvas clear), 0 = fully covered.
  const progressRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const revealedRef = useRef(true);
  const firstObsRef = useRef(true);
  const reducedRef = useRef(false);

  const gridRef = useRef<{
    cols: number;
    rows: number;
    cellW: number;
    cellH: number;
    cssW: number;
    cssH: number;
    thr: Float32Array;
  } | null>(null);

  const propsRef = useRef({ gridSize, edgeHeight, coverColor, duration, direction });
  propsRef.current = { gridSize, edgeHeight, coverColor, duration, direction };

  const rebuild = (entry?: ResizeObserverEntry) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const cr = entry?.contentRect;
    const rectW = cr?.width || container.clientWidth || 1;
    const rectH = cr?.height || container.clientHeight || 1;
    const cssW = Math.max(1, Math.floor(rectW));
    const cssH = Math.max(1, Math.floor(rectH));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;

    const p = propsRef.current;
    const gs = Math.max(1, p.gridSize);
    const cols = Math.max(1, Math.ceil(cssW / gs));
    const rows = Math.max(1, Math.ceil(cssH / gs));
    const cellW = cssW / cols;
    const cellH = cssH / rows;
    const eh = Math.max(0, Math.min(1, p.edgeHeight / 100));
    const dir = p.direction;
    const thr = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let base: number;
        if (dir === "up") base = rows === 1 ? 0 : 1 - r / (rows - 1);
        else if (dir === "down") base = rows === 1 ? 0 : r / (rows - 1);
        else if (dir === "left") base = cols === 1 ? 0 : 1 - c / (cols - 1);
        else base = cols === 1 ? 0 : c / (cols - 1);
        thr[r * cols + c] = base * (1 - eh) + Math.random() * eh;
      }
    }
    gridRef.current = { cols, rows, cellW, cellH, cssW, cssH, thr };
  };

  const draw = () => {
    const ctx = ctxRef.current;
    const grid = gridRef.current;
    if (!ctx || !grid) return;
    const { cols, rows, cellW, cellH, cssW, cssH, thr } = grid;
    ctx.clearRect(0, 0, cssW, cssH);
    const p = progressRef.current;
    if (p >= 1) return;
    ctx.fillStyle = propsRef.current.coverColor;
    const padW = cellW + 1;
    const padH = cellH + 1;
    for (let r = 0; r < rows; r++) {
      const yBase = r * cellH;
      const rowOff = r * cols;
      for (let c = 0; c < cols; c++) {
        if (thr[rowOff + c] > p) ctx.fillRect(c * cellW, yBase, padW, padH);
      }
    }
  };

  const stop = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    runningRef.current = false;
  };

  const loop = (now: number) => {
    if (!runningRef.current) return;
    if (startRef.current == null) startRef.current = now;
    const dur = Math.max(0.0001, propsRef.current.duration);
    const linear = Math.max(0, Math.min(1, (now - startRef.current) / 1000 / dur));
    progressRef.current = easeInOut(linear);
    draw();
    if (linear >= 1) {
      progressRef.current = 1;
      stop();
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  const trigger = () => {
    stop();
    progressRef.current = 0;
    startRef.current = null;
    draw();
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
  };

  useLayoutEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    rebuild();
    draw();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      rebuild(entries[0]);
      draw();
    });
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rebuild();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, edgeHeight, direction, coverColor]);

  useEffect(() => {
    if (reducedRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // Already on screen at first observation (route load / above the
            // fold): leave it revealed, never animate.
            if (firstObsRef.current) {
              firstObsRef.current = false;
              continue;
            }
            if (!revealedRef.current) {
              revealedRef.current = true;
              trigger();
            }
          } else {
            // Scrolled out of view: arm it (covered) so re-entry replays.
            firstObsRef.current = false;
            revealedRef.current = false;
            runningRef.current = false;
            progressRef.current = 0;
            draw();
          }
        }
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}
