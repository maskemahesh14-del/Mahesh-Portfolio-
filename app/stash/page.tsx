import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import styles from "./page.module.css";
import StashSection from "./StashSection";
import PackagingCarousel from "./PackagingCarousel";
import EmailGallery from "./EmailGallery";
import HoverUnderline from "@/components/HoverUnderline";
import { TransitionLink } from "@/components/PixelTransition";

/** Scoped to this route only — the rest of the site stays on Space Grotesk. */
const fredoka = Fredoka({
  variable: "--font-stash",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Stash",
  description:
    "A self-initiated brand built end to end — honest, anti-hype, desi-revival healthy snacking. Identity, packaging, voice and lifecycle creative.",
};

const VOICE_LINES = [
  "we didn't invent anything. these grains were around before the word 'superfood'",
  "roasted, not fried. no maida. no palm oil. no drama",
  "it's just food, calm down",
];

/** `slug` is the filename stem in public/stash/products — kept explicit rather
 *  than lower-casing `name`, so a display-name tweak can't break an image path.
 *  `description` is the crop itself, in the brand's register. */
const SKUS = [
  {
    name: "Nachni",
    grain: "finger millet",
    slug: "nachni",
    hero: true,
    color: "var(--stash-nachni)",
    description:
      "ragi. India's oldest cultivated grain — higher fibre than almost anything else in the snack aisle.",
  },
  {
    name: "Bhutta",
    grain: "corn",
    slug: "bhutta",
    color: "var(--stash-bhutta)",
    description:
      "corn, but the only bag on the shelf that says so instead of hiding it behind a “grain blend.”",
  },
  {
    name: "Jowar",
    grain: "sorghum",
    slug: "jowar",
    color: "var(--stash-jowar)",
    description:
      "a lighter grain, puffed rather than fried. the one that snacks like a snack.",
  },
  {
    name: "Bajra",
    grain: "pearl millet",
    slug: "bajra",
    color: "var(--stash-bajra)",
    description:
      "pearl millet — dense, earthy, the one that actually holds you over.",
  },
];

const HONESTY = [
  "roasted not fried",
  "full of fibre",
  "no maida",
  "no palm oil",
  "no preservatives",
];

/**
 * The four finished sends. Headline and CTA are the emails' own copy; `id`
 * resolves the thumbnail, the full screenshot and the PDF the send route mails.
 * `width`/`height` are the full screenshot's real dimensions — these run to
 * 1:6, so nothing should force them into a fixed ratio.
 */
const EMAILS = [
  {
    id: "welcome",
    label: "welcome",
    headline: "they're feeding corn to cars. eat yours first.",
    cta: "start snacking",
    width: 900,
    height: 5216,
  },
  {
    id: "abandoned-cart",
    label: "abandoned cart",
    headline: "you were literally at checkout. where did you go, bro",
    cta: "come back",
    width: 900,
    height: 3589,
  },
  {
    id: "nachni",
    label: "nachni",
    headline: "the og desi grain",
    cta: "grab your stash",
    width: 900,
    height: 4880,
  },
  {
    id: "bhutta-monday",
    label: "bhutta monday",
    headline: "mondays. am i right?",
    cta: "shop bhutta",
    width: 900,
    height: 3574,
  },
];

/** Vocabulary the brand writes in — not quotes from the four sends above. */
const REGISTER = ["bhai", "yaar", "bas", "matlab"];

export default function StashPage() {
  return (
    <main className={`${styles.stash} ${fredoka.variable}`}>
      <header className={styles.hero}>
        <h1 className={styles.wordmark}>STASH</h1>
        <p className={styles.tagline}>real food, not fad food</p>
      </header>

      <StashSection index="01" heading="the brand">
        <p>
          Honest, anti-hype, desi-revival healthy snacking. The enemy is
          fad-health — protein hype, “superfood” nonsense, overpriced imports.
          The thesis: the old Indian grains our ancestors ate were already the
          honest healthy snack.
        </p>
        <p>
          The voice does the positioning. Deadpan, lowercase, no punctuation —
          it refuses to sell hard, which is the whole point.
        </p>
        <ul className={styles.voiceList}>
          {VOICE_LINES.map((line) => (
            <li key={line} className={styles.voiceLine}>
              {line}
            </li>
          ))}
        </ul>
      </StashSection>

      <StashSection index="02" heading="packaging" wide>
        <p>
          Grain-based single-serve SKUs, each with its own secondary colour,
          plus a variety multipack. Upright carton, a real chip pile on-pack,
          and an honesty panel that lists what the snack isn’t.
        </p>

        <ul className={styles.skuGrid}>
          {SKUS.map((sku) => (
            <li
              key={sku.name}
              className={styles.sku}
              style={{ "--sku": sku.color } as CSSProperties}
            >
              <span className={styles.skuSwatch} />
              <span className={styles.skuName}>{sku.name}</span>
              <span className={styles.skuGrain}>{sku.grain}</span>
              {sku.hero && <span className={styles.skuHero}>HERO</span>}
            </li>
          ))}
          <li className={styles.sku}>
            <span className={`${styles.skuSwatch} ${styles.skuMulti}`} />
            <span className={styles.skuName}>Variety</span>
            <span className={styles.skuGrain}>multipack — all four</span>
          </li>
        </ul>

        <PackagingCarousel skus={SKUS} />

        <div className={styles.panelRow}>
          <div className={styles.panel}>
            <p className={styles.panelTitle}>THE HONESTY PANEL</p>
            <ul className={styles.panelList}>
              {HONESTY.map((item) => (
                <li key={item} className={styles.panelItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ul className={styles.badges}>
            <li className={`${styles.badge} ${styles.badgePink}`}>FIBRE 3g</li>
            <li className={`${styles.badge} ${styles.badgeStamp}`}>
              made with real ingredients
            </li>
            <li className={styles.badge}>100% VEG</li>
          </ul>
        </div>
      </StashSection>

      <StashSection index="03" heading="email design">
        <p>
          Four sends, designed end to end — layout, art direction, and copy.
          Open one to read the whole email, or mail yourself the PDF and see it
          where it was meant to be read.
        </p>

        <EmailGallery emails={EMAILS} />

        <p className={styles.caption}>
          The Hinglish register the whole brand is written in:
        </p>
        <ul className={styles.register}>
          {REGISTER.map((word) => (
            <li key={word} className={styles.registerWord}>
              {word}
            </li>
          ))}
        </ul>
      </StashSection>

      <footer className={styles.footer}>
        <TransitionLink href="/" className={styles.back}>
          <HoverUnderline>← BACK TO WORK</HoverUnderline>
        </TransitionLink>
      </footer>
    </main>
  );
}
