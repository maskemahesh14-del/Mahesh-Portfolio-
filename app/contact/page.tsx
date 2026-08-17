import type { Metadata } from "next";
import styles from "./page.module.css";
import DecodeText from "@/components/DecodeText";
import HoverUnderline from "@/components/HoverUnderline";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Freelance or full-time. If it needs to convert, i want to hear about it.",
};

const EMAIL = "maheshmaske840@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/mahesh-maske-069189244";

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <p className={styles.kicker}>
          <DecodeText text="// CONTACT" mode="enter" />
        </p>

        <h1 className={styles.title}>
          freelance or full-time. if it needs to convert, i want to hear about
          it
        </h1>

        <div className={styles.body}>
          <ul className={styles.links}>
            <li>
              <a className={styles.link} href={`mailto:${EMAIL}`}>
                <span className={styles.linkLabel}>Email</span>
                <HoverUnderline>{EMAIL}</HoverUnderline>
              </a>
            </li>
            <li>
              <a
                className={styles.link}
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.linkLabel}>LinkedIn</span>
                <HoverUnderline>/in/mahesh-maske-069189244 ↗</HoverUnderline>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
