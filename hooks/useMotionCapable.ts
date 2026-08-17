"use client";

import { useEffect, useState } from "react";

export function useMotionCapable() {
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function evaluate() {
      setCapable(!coarse.matches && !reduced.matches);
    }

    evaluate();
    coarse.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);

    return () => {
      coarse.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
    };
  }, []);

  return capable;
}
