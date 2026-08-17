import type { Metadata } from "next";
import CaseStudyLayout from "@/components/case-study/CaseStudyLayout";
import CaseStudyHero from "@/components/case-study/CaseStudyHero";
import CaseStudySection from "@/components/case-study/CaseStudySection";
import MetricCallout, {
  MetricRow,
} from "@/components/case-study/MetricCallout";
import StepList from "@/components/case-study/StepList";

export const metadata: Metadata = {
  title: "Full-Stack UX Redesign: Work",
  description:
    "Research-through-interface redesign for a Toronto B2B industrial cleaning supplier: industry-led navigation, a Buy Canadian surface, and ReStock, a customer-facing reorder product.",
};

const SUMMARY =
  "A Toronto B2B supplier of industrial cleaning consumables was competing against broadline distributors many times its size, while hiding the three advantages that could beat them. I was hired to write Amazon product pages, and followed the content problem upstream into a UX one: the site they owned was a flat catalogue doing none of the selling. I ran a competitive audit and primary research with facilities managers and EHS officers, then rebuilt the experience around how B2B buyers actually purchase: self-serve, long before they contact a vendor. Four structural moves came out of it, including a new customer-facing reorder product.";

const META = [
  { label: "Role", value: "UX: research through interface" },
  { label: "Context", value: "Real client project at DHi Design" },
];

const MOVES = [
  {
    title: "Industry-led navigation",
    body: (
      <p>
        Buyers said they default to vendors who speak their language. So
        industries got promoted to top-level navigation. A healthcare buyer
        never lands on a generic grid again. Nine industry pages, one click
        from home, each curating products and surfacing the compliance
        considerations that sector actually cares about.
      </p>
    ),
  },
  {
    title: "Product pages that teach, not spec-dump",
    body: (
      <p>
        Lead with use-case framing and “where to use it,” industry tags,
        certifications above the fold, and one-click access to safety data
        sheets. Every question answered on the page is one fewer email, and
        the buyers who’d email instead just leave.
      </p>
    ),
  },
  {
    title: "A dedicated Buy Canadian page",
    body: (
      <p>
        The procurement opportunity is invisible if it’s buried in a footer. So
        it became a standalone, indexable surface that cites the policy by name
        with a registration number, offers downloadable eligibility
        certificates a procurement officer can drop straight into a vetting
        file, and routes to a named institutional contact instead of a generic
        sales inbox.
      </p>
    ),
  },
  {
    title: "ReStock: the part that isn’t a website at all",
    body: (
      <p>
        The biggest churn driver wasn’t the storefront. It was the reorder.
        Buyers track consumption in spreadsheets that are correct on Monday and
        wrong by Wednesday; stockouts mean expedited fees or a compliance miss.
        No vendor offered anything better. So I designed one: a customer-facing
        inventory dashboard (live stock, threshold alerts, auto-reorder
        drafts, consumption analytics) gated behind a verified business
        account. The public site is the acquisition surface;{" "}
        <strong>ReStock is the retention surface.</strong> Same customer record
        underneath.
      </p>
    ),
  },
];

const MOATS = [
  {
    title: "Canadian",
    body: (
      <p>
        Headquartered and sourcing domestically, which, under Canada’s new Buy
        Canadian procurement policy, is worth real money to institutional
        buyers.
      </p>
    ),
  },
  {
    title: "Sustainable, verifiably",
    body: (
      <p>
        An in-house textile-reuse programme that turns post-consumer cotton
        into industrial wipers, backed by audited numbers, not a
        marketing claim.
      </p>
    ),
  },
  {
    title: "SMB-priced",
    body: (
      <p>
        Reachable for the small and mid-size buyers the premium distributors
        price out.
      </p>
    ),
  },
];

export default function UxCaseStudyPage() {
  return (
    <CaseStudyLayout>
      <CaseStudyHero
        kicker="// WORK 002"
        title="I was brought in to write product pages. I left having redesigned how the company sells."
        deck="Full-stack UX redesign for a Toronto-based B2B industrial cleaning supplier."
        summary={SUMMARY}
        meta={META}
        note="Client withheld under NDA, visuals brand-stripped"
      />

      <CaseStudySection index="01" heading="Where it started">
        <p>My first job for this client wasn’t UX. It was Amazon.</p>
        <p>
          I was building their A+ content, a branded storefront that told
          buyers what the company actually stood for, and a set of product
          pages that did one job well: educate the person reading them. What
          does this wiper absorb. Where do you use it. Why this one and not the
          cheaper one next to it.
        </p>
        <p>
          Somewhere in that work the real problem got loud. I was pouring brand
          story and product education into Amazon (a platform the company
          doesn’t own), while the website they <em>do</em> own did none of it.
          Their own site was a flat product grid. No context, no education, no
          reason to trust them over a distributor ten times their size.
        </p>
        <p>
          So I took the instinct behind the A+ work (explain the product,
          communicate the brand, remove the reason to call sales) and moved it
          upstream, to the surface that actually decides whether this company
          wins or loses a buyer. That became a full-stack redesign of their
          digital experience.
        </p>
      </CaseStudySection>

      <CaseStudySection
        index="02"
        heading="The company, and the three things it kept hiding"
      >
        <p>
          A Toronto-based B2B supplier of industrial cleaning and safety
          consumables (wipers, absorbents, spill kits) competing in a market
          dominated by broadline distributors many times its size.
        </p>
        <p>
          On paper it should lose. In practice it had three real advantages the
          giants couldn’t match:
        </p>
        <StepList steps={MOATS} ordered={false} />
        <p>
          The site communicated none of the three. It behaved like an
          electronic catalogue in a market that had moved on from catalogues.
        </p>
      </CaseStudySection>

      <CaseStudySection index="03" heading="What the research actually found">
        <p>
          I ran a competitive audit against the four distributors the redesign
          had to beat, and triangulated primary research with the people who
          actually buy this stuff: facilities managers and EHS officers in the
          Greater Toronto Area.
        </p>
        <p>
          The finding that reframed the whole project:{" "}
          <strong>
            B2B buyers now complete most of their purchasing journey before they
            ever contact a vendor.
          </strong>{" "}
          They spend serious money self-serve, they switch suppliers the moment
          the digital experience fails them, and they consult more channels than
          they used to. The website isn’t a brochure the sales team hands out.
          The website <em>is</em> the sales team.
        </p>
        <p>
          Measured against that, the old site failed at exactly the moments that
          decide a sale: it didn’t prove the company understood the buyer’s
          industry, it didn’t surface the certifications and safety
          documentation buyers vet on, and it treated a repeat order (the thing
          that drives the revenue) exactly like a first-time purchase.
        </p>
        <p>
          I built three personas to hold the research steady: a facilities
          manager drowning in a weekly inventory spreadsheet, a healthcare
          compliance approver who won’t call for a safety sheet she should be
          able to download, and a public-sector procurement lead who needs
          provable Canadian eligibility on the page. Read apart they want
          different things. Read together they want the same thing:{" "}
          <strong>
            buy without talking to a salesperson, and see the evidence on the
            page instead of gating it behind one.
          </strong>
        </p>
      </CaseStudySection>

      <CaseStudySection index="04" heading="The reframe">
        <p>
          The brief looked like a website redesign. The research turned it into
          a positioning exercise that happened to ship as a website.
        </p>
        <p>
          The design hypothesis I committed to: if the site communicates the
          three moats credibly and prominently, curates the catalogue by{" "}
          <em>buyer industry</em> instead of by SKU type, and replaces the
          spreadsheet reorder cycle with a real tool, then the company converts
          more first-time buyers and keeps more of the repeat ones.
        </p>
      </CaseStudySection>

      <CaseStudySection index="05" heading="Four structural moves">
        <p>
          Every one is tied to a research finding, not an aesthetic preference.
        </p>
        <StepList steps={MOVES} />
        <p>
          That’s the through-line I’m proudest of: I didn’t just redesign a
          catalogue. I identified where the company was quietly losing customers
          and designed a new product to stop it.
        </p>
      </CaseStudySection>

      <CaseStudySection
        index="06"
        heading="How I know it works: without pretending it shipped"
      >
        <p>
          This was a concept redesign, so I’m not going to hand you a conversion
          lift I didn’t measure. Instead I benchmarked the design the way the
          strategy demanded: against the four competitors, on the heuristics
          that decide B2B purchases.
        </p>
        <MetricRow>
          <MetricCallout
            value="5/5"
            label="On the three B2B-specific heuristics the strategy concentrates on: industry relevance, compliance visibility, self-service depth. No competitor scores 5 on all three; the closest scores 4/4/3."
          />
          <MetricCallout
            value="4–5"
            label="Across all ten Nielsen usability heuristics, matching or edging the strongest competitor on each, by design. The redesign consolidates proven patterns rather than inventing new ones."
          />
          <MetricCallout
            value="2"
            label="Heuristics I scored a 4, not a 5 (power-user efficiency and depth of help documentation), written up honestly as priority directions for a v2, not quietly rounded up."
          />
        </MetricRow>
      </CaseStudySection>

      <CaseStudySection index="07" heading="The part that taught me the most">
        <p>
          Halfway through, I audited my own research against its original
          sources and found several statistics I’d been confidently citing were
          misattributed or imprecisely worded. I corrected them. It was
          uncomfortable and it was the right call: in a research-led project,
          one soft number undermines every decision that leans on it.
          Research-led design doesn’t mean “we did some interviews.” It means
          every visible choice traces back to evidence that survives being
          checked.
        </p>
        <p>
          The other lesson was scoping. Redesigning five hero product pages
          instead of all 546, nine industry pages instead of fifteen, one
          geography of primary research: those weren’t failures of ambition.
          They were the decisions that made the work completable to a standard I
          could defend.
        </p>
        <p>
          Why it’s in my portfolio: it’s the clearest proof of how I work. I
          followed a content problem upstream into a UX problem, questioned what
          the brief assumed, and let the logic of every decision show its work.
          Good UX isn’t decoration on a product. It’s the product.
        </p>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}
