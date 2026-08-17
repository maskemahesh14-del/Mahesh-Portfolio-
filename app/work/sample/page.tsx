import type { Metadata } from "next";
import PlaceholderRoute from "@/components/PlaceholderRoute";

export const metadata: Metadata = {
  title: "Work — Sample",
};

export default function SamplePage() {
  return (
    <PlaceholderRoute
      kicker="// WORK — 000"
      title="Sample Project"
      body="Placeholder case study, kept as the pixel-transition test route."
    />
  );
}
