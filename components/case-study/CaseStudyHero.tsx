import styles from "./CaseStudyHero.module.css";
import DecodeText from "@/components/DecodeText";
import DrawLine from "@/components/DrawLine";

export type MetaItem = { label: string; value: string };

type CaseStudyHeroProps = {
  /** Mono eyebrow, e.g. "// WORK — 002". */
  kicker: string;
  title: string;
  /** One-line positioning statement under the title. */
  deck: string;
  /** ~100 words: problem, role, outcome. */
  summary: string;
  meta: MetaItem[];
  /** Confidentiality line rendered beneath the meta panel. */
  note?: string;
};

export default function CaseStudyHero({
  kicker,
  title,
  deck,
  summary,
  meta,
  note,
}: CaseStudyHeroProps) {
  return (
    <header className={styles.hero}>
      <p className={styles.kicker}>
        <DecodeText text={kicker} mode="enter" />
      </p>

      {/* Plain text, not DecodeText: this is the page's primary content and
          its LCP element — scrambling ~90 characters would delay the one
          thing a reader needs immediately. */}
      <h1 className={styles.title}>{title}</h1>

      <p className={styles.deck}>{deck}</p>

      <DrawLine
        mode="enter"
        d="M0 1 L100 1"
        viewBox="0 0 100 2"
        strokeWidth={1}
        className={styles.rule}
      />

      <div className={styles.lower}>
        <p className={styles.summary}>{summary}</p>

        <dl className={styles.meta}>
          {meta.map(({ label, value }) => (
            <div key={label} className={styles.metaRow}>
              <dt className={styles.metaLabel}>{label}</dt>
              <dd className={styles.metaValue}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {note && <p className={styles.note}>{note}</p>}
    </header>
  );
}
