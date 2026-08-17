export const durations = {
  hover: 120,
  press: 200,
  element: 420,
  scene: 800,
} as const;

export const stagger = 50;

export function toSeconds(milliseconds: number): number {
  return milliseconds / 1000;
}

export const easings = {
  expoOut: {
    css: "cubic-bezier(0.16, 1, 0.3, 1)",
    framer: [0.16, 1, 0.3, 1],
    gsap: "expo.out",
  },
  powerInOut: {
    css: "cubic-bezier(0.65, 0, 0.35, 1)",
    framer: [0.65, 0, 0.35, 1],
    gsap: "power2.inOut",
  },
  backOut: {
    css: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    framer: [0.34, 1.56, 0.64, 1],
    gsap: "back.out(1.7)",
  },
} as const;
