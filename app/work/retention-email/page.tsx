import type { Metadata } from "next";
import CaseStudyLayout from "@/components/case-study/CaseStudyLayout";
import CaseStudyHero from "@/components/case-study/CaseStudyHero";
import CaseStudySection from "@/components/case-study/CaseStudySection";
import MetricCallout, {
  MetricRow,
} from "@/components/case-study/MetricCallout";
import StepList from "@/components/case-study/StepList";

export const metadata: Metadata = {
  title: "Retention Email & WhatsApp: Work",
  description:
    "Email and WhatsApp creative for three D2C retention programs (skincare, fashion, supplements), built on one idea: earn the second order instead of forcing a bigger first one.",
};

const SUMMARY =
  "I designed the email and WhatsApp creative for retention programs across three D2C brands (skincare, fashion, supplements). The campaigns, the lifecycle creative, the content series, the WhatsApp sends: the part the customer actually sees and reacts to. Read the numbers here honestly: they’re program results the creative I built helped carry, not numbers I generated alone. That’s the only kind of number worth putting in a portfolio. What makes the three worth showing together isn’t three separate wins; it’s that they all run on one idea: earn the second order instead of forcing a bigger first one.";

const META = [
  {
    label: "Role",
    value: "Email + WhatsApp creative (strategy set with the wider team)",
  },
  { label: "Scope", value: "Three D2C brands (skincare, fashion, supplements)" },
];

const LADDER = [
  {
    title: "Hero",
    body: (
      <p>
        Lead with the product that shows the most visible result: the one that
        makes someone go “oh, this actually works.” <strong>Trust earned.</strong>
      </p>
    ),
  },
  {
    title: "Routine",
    body: (
      <p>
        Now they’ve felt it work, so you nudge: “loved it? complete the
        routine.” <strong>Trust turns into a bigger basket.</strong>
      </p>
    ),
  },
  {
    title: "Explore",
    body: (
      <p>
        “Skin sorted. Now meet the rest.” The trust built on one shelf carries
        to the next. <strong>Trust stretches across the brand.</strong>
      </p>
    ),
  },
  {
    title: "Gift",
    body: (
      <p>
        “Give this to someone you love.” Nobody gifts a brand they’re unsure
        about. <strong>Trust becomes belief.</strong>
      </p>
    ),
  },
];

const SKINCARE_WORK = [
  {
    title: "A skin-type-personalised creative system",
    body: (
      <p>
        The quiz captured preferences for ~40% of the list, and I built the
        campaign creative to flex to each type instead of one generic
        broadcast.
      </p>
    ),
  },
  {
    title: "“Glow Guide” content IP",
    body: (
      <p>
        A weekly skin-education series, including the “Skin Win Wednesday”
        WhatsApp stories, designed to keep the brand useful between purchases,
        not just present at the sell.
      </p>
    ),
  },
  {
    title: "Lifecycle creative across 8 flows",
    body: (
      <p>
        The sequenced cross-sell moments (cleanser → serum at Day 30 →
        moisturiser at Day 45) and the “running low” replenishment triggers,
        each designed for its exact moment in the ladder.
      </p>
    ),
  },
];

export default function RetentionEmailCaseStudyPage() {
  return (
    <CaseStudyLayout>
      <CaseStudyHero
        kicker="// WORK 001"
        title="The creative that earns the second order"
        deck="Email & WhatsApp design for three D2C retention programs (skincare, fashion, supplements)."
        summary={SUMMARY}
        meta={META}
        note="Brands withheld under NDA; figures are real program outcomes"
      />

      <CaseStudySection index="01" heading="The idea the creative is built on">
        <p>
          A first-time buyer doesn’t trust the brand yet. So you don’t lead with
          “buy the routine.” You earn it.
        </p>
        <p>
          <strong>Hero → routine → explore → gift.</strong>
        </p>
        <StepList steps={LADDER} />
        <p>
          The programs aren’t forcing a bigger first order. They’re earning the
          second one. The third. And the one a customer’s friend places for
          them. Every piece of creative I design has a job inside that ladder,
          and knowing which rung a send is on is what makes the design
          decisions, not decoration.
        </p>
      </CaseStudySection>

      <CaseStudySection
        index="02"
        heading="Hero deep-dive, Skincare: quiz-to-cash"
      >
        <p>
          <strong>The problem the creative had to solve:</strong> 72% of
          customers never bought past the starter serum. Campaigns were
          identical across every skin type, open rates were single-digit, and
          cross-sells converted under 1%.
        </p>
        <p>
          <strong>What I designed against it:</strong>
        </p>
        <StepList steps={SKINCARE_WORK} ordered={false} />
        <MetricRow>
          <MetricCallout
            value="₹89L"
            label="Program revenue, alongside $99K incremental revenue over 7 months."
          />
          <MetricCallout
            value="+41%"
            label="Cross-category purchase rate, with 1.8× better flow performance."
          />
          <MetricCallout
            value="2.5×"
            label="Day-30 replenishment WhatsApp campaigns outperformed email: the finding that reshaped how I designed for channel across the rest of the work."
          />
        </MetricRow>
      </CaseStudySection>

      <CaseStudySection
        index="03"
        heading="Breadth: same thinking, different category"
      >
        <h3>Fashion: VIP community drives category expansion</h3>
        <p>
          83% of customers were stuck in a single category, new launches were
          hitting 25% of potential, and email engagement sat under 2% with no
          social proof.
        </p>
        <p>
          I designed the creative for a cross-category “Style Journey” (dress →
          accessories at Day 20 → coordinated sets at Day 45), a{" "}
          <strong>“Monday Muse” UGC series</strong> that put real customer
          photos and styling tips into the emails for social proof, the VIP
          WhatsApp inner-circle sends for 1,800 early-access members, and a
          5-touch pre-launch warm-up from sneak peek to public launch.
        </p>
        <MetricRow>
          <MetricCallout value="+26%" label="Order frequency." />
          <MetricCallout value="3.5×" label="Launch performance." />
          <MetricCallout value="+31%" label="Repeat rate over 90 days." />
        </MetricRow>

        <h3>Supplements: community-led retention</h3>
        <p>
          67% never reordered after the first bottle: skepticism without
          guidance, generic recommendations, no community to build adherence.
        </p>
        <p>
          I designed the creative for a WhatsApp Wellness Hub (a 3,200-member
          community with daily tips), the bi-weekly expert AMA promotions that
          drove 73% weekly engagement, the health-quiz creative for personalised
          supplement stacks, and the “running low” replenishment flows built
          around serving sizes.
        </p>
        <MetricRow>
          <MetricCallout value="2.2×" label="Higher subscription rate." />
          <MetricCallout
            value="48%"
            label="90-day retention, against a 32% industry benchmark."
          />
          <MetricCallout
            value="₹95L"
            label="Community-attributed revenue."
          />
        </MetricRow>
      </CaseStudySection>

      <CaseStudySection index="04" heading="Why this is in my portfolio">
        <p>
          Three categories, one system. The creative changes (skincare glow
          guides, fashion UGC, supplement communities), but the logic underneath
          is the same every time: design for the rung of the ladder the customer
          is actually standing on, and earn the next order instead of forcing a
          bigger first one.
        </p>
        <p>
          I design email and WhatsApp creative. But I design it knowing exactly
          what funnel it’s serving and why, which is the difference between
          making a nice email and making one that moves a number.
        </p>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}
