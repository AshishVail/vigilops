import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { LiveDemoCta } from "@/components/marketing/live-demo-cta";
import { ArchitecturePreview } from "@/components/marketing/architecture-preview";
import { Footer } from "@/components/marketing/footer";

export default function MarketingPage() {
  return (
    <main>
      <Hero />
      <FeatureGrid />
      <ArchitecturePreview />
      <LiveDemoCta />
      <Footer />
    </main>
  );
}
