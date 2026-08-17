"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./EmailGallery.module.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLenis } from "@/components/SmoothScrollProvider";

export type StashEmail = {
  /**
   * Drives all three assets and the API allowlist:
   *   /stash/emails/thumbs/{id}-thumb.jpg
   *   /stash/emails/{id}-email.jpg
   *   content/stash-email-pdfs/{id}.pdf
   */
  id: string;
  label: string;
  /** The email's own headline, verbatim. */
  headline: string;
  /** The email's own CTA button copy, verbatim. */
  cta: string;
  /** Intrinsic size of the full-length screenshot. */
  width: number;
  height: number;
};

/** Every thumbnail is pre-cropped to this frame, which is what makes the grid uniform. */
const THUMB_W = 900;
const THUMB_H = 1200;

/** Matches the API's own check. Deliberately loose — the real test is delivery. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type OpenState = { index: number; container: HTMLElement };

export default function EmailGallery({ emails }: { emails: StashEmail[] }) {
  const [open, setOpen] = useState<OpenState | null>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    setOpen((current) => {
      // Hand focus back to the tile that opened the modal.
      if (current) tileRefs.current[current.index]?.focus();
      return null;
    });
  }, []);

  return (
    <>
      <ul className={styles.grid}>
        {emails.map((email, index) => (
          <li key={email.id} className={styles.tile}>
            <button
              type="button"
              ref={(node) => {
                tileRefs.current[index] = node;
              }}
              className={styles.trigger}
              onClick={(event) => {
                /*
                 * The modal has to escape this section: StashSection tweens it
                 * with GSAP, which leaves a transform behind, and a transformed
                 * ancestor becomes the containing block for position: fixed —
                 * the scrim would cover the section, not the viewport.
                 *
                 * <main> rather than <body> because the whole --stash-* palette
                 * is scoped to it; portalling further out would strip the modal
                 * of every colour it uses. Resolved here rather than from a ref
                 * during render, which React forbids.
                 */
                setOpen({
                  index,
                  container:
                    event.currentTarget.closest("main") ?? document.body,
                });
              }}
              aria-haspopup="dialog"
            >
              <span className={styles.frame}>
                <Image
                  src={`/stash/emails/thumbs/${email.id}-thumb.jpg`}
                  alt={`${email.label} email, top of the layout`}
                  width={THUMB_W}
                  height={THUMB_H}
                  sizes="(max-width: 48rem) 90vw, 30rem"
                  className={styles.thumb}
                />
                <span className={styles.expand} aria-hidden="true">
                  expand
                </span>
              </span>

              <span className={styles.caption}>
                <span className={styles.name}>{email.label}</span>
                <span className={styles.headline}>{email.headline}</span>
                <span className={styles.cta}>{email.cta}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <EmailModal
          email={emails[open.index]}
          onClose={close}
          container={open.container}
        />
      )}
    </>
  );
}

function EmailModal({
  email,
  onClose,
  container,
}: {
  email: StashEmail;
  onClose: () => void;
  /** Portal target — see the call site for why this isn't rendered in place. */
  container: HTMLElement;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();
  const titleId = useId();

  // Freeze the page behind the modal. Lenis owns scroll, so stopping it is
  // the lock — no body overflow toggle, which would change document height
  // and set SmoothScrollProvider's ResizeObserver off.
  useEffect(() => {
    const instance = lenis.current;
    instance?.stop();
    return () => {
      instance?.start();
    };
  }, [lenis]);

  useEffect(() => {
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => !node.hasAttribute("disabled"));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Wrap at both ends so focus can't escape to the page behind.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portalled out of the section: StashSection applies a GSAP scroll-reveal
  // transform to its root <section>, and GSAP leaves that transform on the
  // element even at rest. A transformed ancestor becomes the containing
  // block for any position:fixed descendant, so without the portal this
  // modal centers itself against that section's box instead of the real
  // viewport — which is what put it down near the bottom of the screen.
  //
  // Target is <main>, not <body>: <main> carries the .stash class, and every
  // --stash-* colour this modal uses is scoped to it. Portalling to <body>
  // fixes the position but leaves the panel with no palette to read.
  return createPortal(
    <div
      className={styles.scrim}
      data-reduced={reduced ? "true" : "false"}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // The scrim closes on click; without this a click inside the panel
        // would bubble up to it and close the modal too.
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.panelHead}>
          <p className={styles.panelTitle} id={titleId}>
            <span className={styles.name}>{email.label}</span>
            <span className={styles.headline}>{email.headline}</span>
          </p>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Without data-lenis-prevent this scroller silently refuses to move:
            Lenis takes the wheel event for the page and allowNestedScroll is off. */}
        <div className={styles.reader} data-lenis-prevent>
          {/* eslint-disable-next-line @next/next/no-img-element --
              Deliberate: next/image fits the image to its container, and this
              one has to overflow so there is something to scroll. */}
          <img
            className={styles.full}
            src={`/stash/emails/${email.id}-email.jpg`}
            alt={`${email.label} email, full layout`}
            width={email.width}
            height={email.height}
            decoding="async"
          />
        </div>

        <SendToInbox emailId={email.id} />
      </div>
    </div>,
    container,
  );
}

type SendStatus = "idle" | "sending" | "sent" | "error";

/**
 * Sends the original PDF of this email to whatever address is typed in — the
 * point being that a designed email is meant to be read in an inbox on a
 * phone, not as a screenshot on a desktop.
 */
function SendToInbox({ emailId }: { emailId: string }) {
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [message, setMessage] = useState("");
  const inputId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_RE.test(to)) {
      setStatus("error");
      setMessage("that doesn't look like an email address");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/send-stash-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, to }),
      });

      // A missing API key comes back as a normal 503 with a body, so it lands
      // here as an error message rather than an unhandled throw.
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error ?? "couldn't send that, try again");
        return;
      }

      setStatus("sent");
      setMessage("sent. check your inbox");
    } catch {
      setStatus("error");
      setMessage("couldn't send that, try again");
    }
  }

  return (
    /*
     * noValidate so this form's own check runs: with native validation on, an
     * invalid address is blocked by the browser's tooltip and onSubmit never
     * fires, so the inline error below would never appear. type="email" stays
     * for the mobile keyboard.
     */
    <form className={styles.send} onSubmit={onSubmit} noValidate>
      <label className={styles.sendLabel} htmlFor={inputId}>
        see it on your phone
      </label>

      <div className={styles.sendRow}>
        <input
          id={inputId}
          className={styles.sendInput}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage("");
            }
          }}
          disabled={status === "sending"}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={status === "sending" || to.length === 0}
        >
          {status === "sending" ? "sending…" : "send to my inbox"}
        </button>
      </div>

      {message && (
        <p className={styles.sendStatus} data-status={status} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
