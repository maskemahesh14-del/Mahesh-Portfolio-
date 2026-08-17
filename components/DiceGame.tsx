"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import DiceRoll from "./DiceRoll";
import type { DiceRollHandle } from "./DiceRoll";
import TrollOverlay, { pickTrollLine } from "./TrollOverlay";
import styles from "./DiceGame.module.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Beat between your dice settling and mine being thrown. */
const REPLY_DELAY_MS = 450;

type Phase = "idle" | "you" | "me";
type Outcome = "you" | "me" | null;

const CONFETTI_COLORS = ["#c6f24e", "#edede6", "#8fae3a"];

const TURN_TEXT: Record<Phase, string> = {
  idle: "your turn",
  you: "rolling…",
  me: "my turn…",
};

const randInt = (lo: number, hi: number) =>
  lo + Math.floor(Math.random() * (hi - lo + 1));
const rollDie = () => randInt(1, 6);
const rollFairSum = () => rollDie() + rollDie();

/**
 * A fresh fair 2d6 sum for me, resampled until it differs from yours.
 *
 * This is rejection sampling, not a biased pick: by the symmetry of two
 * i.i.d. dice, P(me > you) === P(you > me) always, for any fixed `yourSum`.
 * Conditioning that same fair distribution on "not equal" removes the tie
 * outcome without disturbing that symmetry — it does not favour either side.
 */
function pickMySum(yourSum: number): number {
  let sum = rollFairSum();
  while (sum === yourSum) sum = rollFairSum();
  return sum;
}

/** Splits a total into two faces that can actually show it. */
function splitSum(sum: number): [number, number] {
  const first = randInt(Math.max(1, sum - 6), Math.min(6, sum - 1));
  return [first, sum - first];
}

function fireConfetti() {
  const shared = {
    particleCount: 60,
    spread: 55,
    startVelocity: 45,
    ticks: 220,
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
  };
  // Angled inward from each edge so the bursts meet over the middle.
  confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.7 } });
}

export default function DiceGame() {
  const reduced = usePrefersReducedMotion();
  const yourDice = useRef<DiceRollHandle>(null);
  const myDice = useRef<DiceRollHandle>(null);

  /**
   * Synchronous gate. `phase` drives the UI, but a click handler reads stale
   * state within the same event, so the ref is what actually guarantees one
   * click is one full round.
   */
  const busyRef = useRef(false);
  const yourSumRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const lastTrollLineRef = useRef<string | undefined>(undefined);

  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [result, setResult] = useState("");
  const [tally, setTally] = useState({ you: 0, me: 0 });
  const [trollLine, setTrollLine] = useState<string | null>(null);
  /**
   * Gated in JS, not just CSS: `display: none` would still leave the WebGL
   * contexts alive with their render loops running, which is exactly the cost
   * worth avoiding on a phone.
   */
  const [wideEnough, setWideEnough] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 40rem)");
    const evaluate = () => setWideEnough(query.matches);
    evaluate();
    query.addEventListener("change", evaluate);
    return () => query.removeEventListener("change", evaluate);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  /** Your dice have landed — hand the turn over to me. */
  const handleYourResult = useCallback((sum: number) => {
    yourSumRef.current = sum;
    setPhase("me");
    timerRef.current = window.setTimeout(() => {
      // Resampled until it differs from yours — see pickMySum. Never forced
      // toward losing: the distribution stays fair, only the tie is excluded.
      const mySum = pickMySum(sum);
      myDice.current?.roll(splitSum(mySum));
    }, REPLY_DELAY_MS);
  }, []);

  const handleMyResult = useCallback(
    (sum: number) => {
      const you = yourSumRef.current;
      // sum can never equal `you` — pickMySum guarantees it — so this is
      // always a clean two-way split, no tie branch needed.
      if (you > sum) {
        setOutcome("you");
        setResult(`you win ${you}–${sum}`);
        setTally((t) => ({ ...t, you: t.you + 1 }));
        if (!reduced) fireConfetti();
      } else {
        setOutcome("me");
        setResult(`i win ${sum}–${you}`);
        setTally((t) => ({ ...t, me: t.me + 1 }));
        const line = pickTrollLine(lastTrollLineRef.current);
        lastTrollLineRef.current = line;
        setTrollLine(line);
      }

      busyRef.current = false;
      setPhase("idle");
    },
    [reduced]
  );

  const handleRoll = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    setOutcome(null);
    setResult("");
    setPhase("you");
    // Fair roll — nothing forced on either side.
    yourDice.current?.roll();
  }, []);

  /** "run it back": closes the takeover and throws again immediately. */
  const handleDismissTroll = useCallback(() => {
    setTrollLine(null);
    handleRoll();
  }, [handleRoll]);

  const dieProps = {
    count: 2,
    spread: 15,
    turns: 3,
    hop: 24,
    // updateCamera already pads the throw's bounding box, so 100 means "as
    // large as fits" — anything above it is ignored, below it zooms out.
    sizePercent: 100,
    shadow: true,
    bodyColor: "#EDEDE6",
    numberColor: "#0E0E0C",
    // Reduced motion keeps the throw — it is the whole point — but drops the
    // ambient sway that would otherwise never stop.
    idleSpin: reduced ? 0 : 10,
    interactive: false,
  };

  if (!wideEnough) return null;

  return (
    <>
      <button
        type="button"
        className={styles.panel}
        onClick={handleRoll}
        disabled={phase !== "idle"}
        aria-label="Roll the dice"
      >
        <span className={styles.head}>
          <span
            className={styles.turn}
            data-phase={phase}
            data-reduced={reduced ? "true" : "false"}
          >
            {TURN_TEXT[phase]}
          </span>
          <span className={styles.tally}>
            you {tally.you} · {tally.me} me
          </span>
        </span>

        <span className={styles.dice}>
          <span className={styles.side}>
            <span className={styles.dieBox}>
              <DiceRoll
                {...dieProps}
                ref={yourDice}
                onResult={handleYourResult}
              />
            </span>
            <span className={styles.label}>you</span>
          </span>

          <span className={styles.side}>
            <span className={styles.dieBox}>
              <DiceRoll {...dieProps} ref={myDice} onResult={handleMyResult} />
            </span>
            <span className={styles.label}>me</span>
          </span>
        </span>

        <span className={styles.result} data-outcome={outcome ?? "none"}>
          {result || "highest of two dice takes it"}
        </span>
      </button>

      {/* Sibling, not a child of the panel: a <button> cannot contain
          another <button>, and "run it back" needs to be one. */}
      {trollLine && (
        <TrollOverlay line={trollLine} onDismiss={handleDismissTroll} />
      )}
    </>
  );
}
