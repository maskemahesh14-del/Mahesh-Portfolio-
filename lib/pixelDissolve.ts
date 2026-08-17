/**
 * WebGL renderer for the pixel-dissolve route transition.
 *
 * Fullscreen quad; the fragment shader divides the viewport into square
 * blocks. Each block gets a hashed threshold — as `progress` sweeps 0→1
 * the blocks pop in (growing from their centers) in pseudo-random order
 * until the screen is fully covered; sweeping back 1→0 shrinks them away.
 * A different `seed` per phase gives cover and reveal distinct patterns.
 *
 * No React, no timers, no internal rAF — the caller drives `render`.
 */

type Rgb = [number, number, number];

export type DissolveRenderer = {
  /** Draw one frame. progress: 0 = clear, 1 = fully covered. */
  render: (progress: number, seed: number) => void;
  /** Match the drawing buffer to the canvas's CSS size (call after mount). */
  resize: () => void;
  dispose: () => void;
};

type DissolveOptions = {
  /** Block size in CSS pixels. */
  blockPx: number;
};

/** Fullscreen-quad vertex shader, shared by every dissolve variant. */
export const QUAD_VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * Sin-free hash — avoids the precision banding sin-based hashes show on
 * mediump GPUs. (Dave Hoskins, hashwithoutsine.)
 */
export const HASH12_GLSL = `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

const VERT = QUAD_VERT;

const FRAG = `
precision mediump float;

uniform float uProgress;
uniform float uSeed;
uniform float uBlock;
uniform vec3 uBase;
uniform vec3 uAccent;

/* Fraction of the progress range over which a single block grows in. */
const float WINDOW = 0.18;

${HASH12_GLSL}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uBlock);
  vec2 local = fract(gl_FragCoord.xy / uBlock) - 0.5;

  float t = hash12(cell + uSeed) * (1.0 - WINDOW);
  float appear = clamp((uProgress - t) / WINDOW, 0.0, 1.0);

  /* Chebyshev distance: blocks grow as squares from their centers. */
  float cheby = max(abs(local.x), abs(local.y));
  float inBlock = step(cheby, 0.5 * appear) * step(0.001, appear);

  /* Subtle per-block luminance jitter + rare accent "hot pixels". */
  float lum = 0.8 + 0.6 * hash12(cell * 1.7 + uSeed + 13.0);
  vec3 col = uBase * lum;
  float sparkle = step(0.985, hash12(cell + uSeed + 41.0));
  col = mix(col, uAccent, sparkle * 0.55);

  /* Premultiplied alpha out. */
  gl_FragColor = vec4(col * inBlock, inBlock);
}
`;

export function parseHex(raw: string, fallback: Rgb): Rgb {
  const hex = raw.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Compiles and links a fullscreen-quad program, or null if anything fails. */
export function linkProgram(
  gl: WebGLRenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram | null {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSource);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  if (!vert || !frag || !program) return null;

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function createDissolveRenderer(
  canvas: HTMLCanvasElement,
  { blockPx }: DissolveOptions,
): DissolveRenderer | null {
  /*
   * `getContext('webgl')` — and WebGL calls generally — are not guaranteed to
   * fail softly. Privacy-hardened browsers (fingerprint farbling, disabled
   * hardware acceleration, a capped context budget) can make context or
   * resource creation throw instead of returning null. This runs inside a
   * layout effect, so an uncaught throw here is a React error-boundary event,
   * not a local failure — it takes down the whole route segment that
   * mounted it, not just this canvas. Every caller already treats a null
   * return as "dissolve unavailable, skip it", so folding thrown errors into
   * that same contract is a pure robustness win with no new case to handle.
   */
  try {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return null;

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vert || !frag || !program) return null;

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uProgress = gl.getUniformLocation(program, "uProgress");
    const uSeed = gl.getUniformLocation(program, "uSeed");
    const uBlock = gl.getUniformLocation(program, "uBlock");
    const uBase = gl.getUniformLocation(program, "uBase");
    const uAccent = gl.getUniformLocation(program, "uAccent");

    const style = getComputedStyle(document.documentElement);
    const base = parseHex(
      style.getPropertyValue("--color-base"),
      [0.055, 0.055, 0.047],
    );
    const accent = parseHex(
      style.getPropertyValue("--color-accent"),
      [0.776, 0.949, 0.306],
    );
    gl.uniform3fv(uBase, base);
    gl.uniform3fv(uAccent, accent);
    gl.clearColor(0, 0, 0, 0);

    let deviceBlock = blockPx;

    return {
      resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
        canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
        deviceBlock = blockPx * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      },
      render(progress, seed) {
        gl.uniform1f(uProgress, progress);
        gl.uniform1f(uSeed, seed);
        gl.uniform1f(uBlock, deviceBlock);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
      dispose() {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      },
    };
  } catch {
    return null;
  }
}
