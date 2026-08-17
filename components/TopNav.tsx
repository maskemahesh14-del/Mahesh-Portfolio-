"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./TopNav.module.css";
import HoverUnderline from "./HoverUnderline";
import { TransitionLink, usePixelTransition } from "./PixelTransition";
import { useLenis } from "./SmoothScrollProvider";
import { useMagnetic } from "@/hooks/useMagnetic";

const NAV_ITEMS = [
  { label: "Work", href: "/" },
  { label: "About", href: "/about" },
  { label: "Stash", href: "/stash" },
  { label: "Gadget", href: "/gadget" },
  { label: "Contact", href: "/contact" },
];

function NavLink({ label, href }: { label: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref);

  return (
    <TransitionLink ref={ref} href={href} className={styles.item}>
      <HoverUnderline>{label}</HoverUnderline>
    </TransitionLink>
  );
}

/**
 * "Work" has no route of its own — selected work lives on the home page — so
 * on home it scrolls to the section, and from anywhere else it routes home.
 */
function WorkLink() {
  const ref = useRef<HTMLButtonElement>(null);
  useMagnetic(ref);
  const pathname = usePathname();
  const lenisRef = useLenis();
  const { navigate } = usePixelTransition();

  function handleClick() {
    if (pathname !== "/") {
      navigate("/");
      return;
    }
    const section = document.getElementById("work");
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(top, { offset: -20 });
    else window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={styles.item}
      onClick={handleClick}
    >
      <HoverUnderline>Work</HoverUnderline>
    </button>
  );
}

export default function TopNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <ul className={styles.list}>
        {NAV_ITEMS.map(({ label, href }) => (
          <li key={label}>
            {label === "Work" ? (
              <WorkLink />
            ) : (
              <NavLink label={label} href={href} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
