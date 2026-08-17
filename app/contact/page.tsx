import type { Metadata } from "next";
import styles from "./page.module.css";
import ContactForm from "./ContactForm";
import DecodeText from "@/components/DecodeText";
import HoverUnderline from "@/components/HoverUnderline";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Freelance or full-time — if it needs to convert, i want to hear about it.",
};

// Placeholders — swap for the real handles before launch.
const EMAIL = "hello@example.com";
const LINKEDIN = "https://www.linkedin.com/in/your-handle";
const RESUME = "/resume.pdf";

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <p className={styles.kicker}>
          <DecodeText text="// CONTACT" mode="enter" />
        </p>

        <h1 className={styles.title}>
          freelance or full-time — if it needs to convert, i want to hear about
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
                <HoverUnderline>/in/your-handle ↗</HoverUnderline>
              </a>
            </li>
            <li>
              <a className={styles.link} href={RESUME} download>
                <span className={styles.linkLabel}>Resume</span>
                <HoverUnderline>Download PDF ↓</HoverUnderline>
              </a>
            </li>
          </ul>

          <ContactForm />
        </div>
      </div>
    </main>
  );
}
