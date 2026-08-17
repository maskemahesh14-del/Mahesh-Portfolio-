"use client";

import styles from "./Hero.module.css";
import DecodeText from "./DecodeText";
import DiceGame from "./DiceGame";

const TITLE = "Mahesh ’26";
const SUBTEXT = "email design, ux design & gen ai";
const INTRO =
  "Design was the thing I did before anyone paid me to. The tools grew up — email, UX, generative AI — but the pull to make something that actually works never changed.";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <DecodeText text={TITLE} mode="enter" />
        </h1>
        <p className={styles.subtext}>{SUBTEXT}</p>
        <p className={styles.intro}>{INTRO}</p>
      </div>

      <div className={styles.dicePanel}>
        <DiceGame />
      </div>
    </section>
  );
}
