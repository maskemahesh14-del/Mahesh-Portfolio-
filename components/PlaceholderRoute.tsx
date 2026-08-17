import styles from "./PlaceholderRoute.module.css";
import DecodeText from "./DecodeText";
import HoverUnderline from "./HoverUnderline";
import { TransitionLink } from "./PixelTransition";

type PlaceholderRouteProps = {
  /** Mono eyebrow, e.g. "// WORK — 001". */
  kicker: string;
  title: string;
  body?: string;
};

/**
 * Minimal stand-in for a route whose real content lands in a later step.
 * Shared by every placeholder so they stay visually identical for free.
 */
export default function PlaceholderRoute({
  kicker,
  title,
  body,
}: PlaceholderRouteProps) {
  return (
    <main className={styles.page}>
      <p className={styles.kicker}>{kicker}</p>
      <h1 className={styles.headline}>
        <DecodeText text={title} mode="enter" />
      </h1>
      {body && <p className={styles.body}>{body}</p>}
      <TransitionLink href="/" className={styles.back}>
        <HoverUnderline>← BACK HOME</HoverUnderline>
      </TransitionLink>
    </main>
  );
}
