import type { Metadata } from "next";
import styles from "./page.module.css";
import CaseStudySection from "@/components/case-study/CaseStudySection";
import StepList from "@/components/case-study/StepList";
import VisualPlaceholder from "@/components/case-study/VisualPlaceholder";
import DecodeText from "@/components/DecodeText";
import HoverUnderline from "@/components/HoverUnderline";
import { TransitionLink } from "@/components/PixelTransition";

export const metadata: Metadata = {
  title: "About",
  description:
    "Designer working across email, web and commerce — research through interface. Good UX isn't decoration on a product, it is the product.",
};

const HOW_I_WORK = [
  {
    title: "Understand the user",
    body: (
      <p>
        Before anything gets designed, I want to know who is actually on the
        other end and what they are trying to finish. Research isn’t a phase I
        pass through — it’s the thing every later decision has to trace back
        to.
      </p>
    ),
  },
  {
    title: "Question assumptions early",
    body: (
      <p>
        Briefs arrive with answers already baked in. The most useful thing I
        can do is ask whether the stated problem is the real one — that’s how a
        request to write product pages turned into a redesign of how a company
        sells.
      </p>
    ),
  },
  {
    title: "Make the logic self-evident",
    body: (
      <p>
        If someone has to have the interface explained to them, the design is
        doing the talking instead of the product. I want the reasoning visible
        in the thing itself, so the next person can pick it up and defend it.
      </p>
    ),
  },
];

const SKILLS = ["Email", "Web/UX", "Amazon A+", "Motion", "Copy"];
const TOOLS = [
  "Figma",
  "Hand-coded HTML/CSS",
  "After Effects",
  "AI image/video",
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <header className={styles.hero}>
          <p className={styles.kicker}>
            <DecodeText text="// ABOUT" mode="enter" />
          </p>
          <h1 className={styles.title}>
            I design the part of the product that has to convince someone.
          </h1>
          <p className={styles.intro}>
            I’m Mahesh — a designer working across email, web and commerce. I
            came into UX sideways: I was hired to write Amazon product pages,
            followed the content problem upstream, and ended up redesigning how
            the company sold. That’s the pattern in most of my work — start
            where the customer actually is, then follow the logic as far as it
            goes.
          </p>
          <p className={styles.pullQuote}>
            good UX isn’t decoration on a product — it is the product
          </p>
        </header>

        <CaseStudySection index="01" heading="How I work">
          <StepList steps={HOW_I_WORK} />
        </CaseStudySection>

        <CaseStudySection index="02" heading="Background">
          <div className={styles.factGrid}>
            <div className={styles.fact}>
              <p className={styles.factLabel}>Practice</p>
              <p className={styles.factValue}>DHi Design</p>
            </div>
            <div className={styles.fact}>
              <p className={styles.factLabel}>Education</p>
              <p className={styles.factValue}>
                B.Des Product Design, UID
              </p>
            </div>
          </div>
          <VisualPlaceholder label="Portrait" ratio="4 / 5" note="Photo" />
        </CaseStudySection>

        <CaseStudySection index="03" heading="Skills and tools">
          <div className={styles.skillsGrid}>
            <div>
              <p className={styles.listLabel}>Skills</p>
              <ul className={styles.chips}>
                {SKILLS.map((item) => (
                  <li key={item} className={styles.chipAccent}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={styles.listLabel}>Tools</p>
              <ul className={styles.chips}>
                {TOOLS.map((item) => (
                  <li key={item} className={styles.chip}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CaseStudySection>

        <section className={styles.cta}>
          <p className={styles.ctaLine}>
            Freelance or full-time — if it needs to convert, I want to hear
            about it.
          </p>
          <TransitionLink href="/contact" className={styles.ctaLink}>
            <HoverUnderline>GET IN TOUCH →</HoverUnderline>
          </TransitionLink>
        </section>
      </div>
    </main>
  );
}
