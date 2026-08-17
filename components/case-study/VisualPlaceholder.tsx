import styles from "./VisualPlaceholder.module.css";

type VisualPlaceholderProps = {
  /** What the finished asset will be, taken from the source [Visual: …] marker. */
  label: string;
  /** CSS aspect-ratio, e.g. "16 / 9". */
  ratio?: string;
  /** Optional second line, e.g. a note on how it will be brand-stripped. */
  note?: string;
};

export default function VisualPlaceholder({
  label,
  ratio = "16 / 9",
  note,
}: VisualPlaceholderProps) {
  return (
    <figure className={styles.frame} style={{ aspectRatio: ratio }}>
      <figcaption className={styles.caption}>
        <span className={styles.tag}>[ VISUAL ]</span>
        <span className={styles.label}>{label}</span>
        {note && <span className={styles.note}>{note}</span>}
      </figcaption>
      <span className={styles.ratio} aria-hidden="true">
        {ratio.replace(/\s/g, "")}
      </span>
    </figure>
  );
}
