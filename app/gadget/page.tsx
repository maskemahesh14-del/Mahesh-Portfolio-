import type { Metadata } from "next";
import PlaceholderRoute from "@/components/PlaceholderRoute";

export const metadata: Metadata = {
  title: "Gadget",
};

export default function GadgetPage() {
  return (
    <PlaceholderRoute
      kicker="// GADGET"
      title="Coming soon"
      body="An interactive toy lives here. It's a separate build. This route exists so the nav resolves."
    />
  );
}
