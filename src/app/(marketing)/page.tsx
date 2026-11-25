import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { LiveDemoCta } from "@/components/marketing/live-demo-cta";
import { ArchitecturePreview } from "@/components/marketing/architecture-preview";
import { Footer } from "@/components/marketing/footer";
import { BottomCta, FaqSection, HowItWorks, MetricsStrip, UseCases } from "@/components/marketing/platform-sections";

export default function MarketingPage() {
  return (
    <main>
      <Hero />
      <MetricsStrip />
      <FeatureGrid />
      <HowItWorks />
      <UseCases />
      <ArchitecturePreview />
      <FaqSection />
      <LiveDemoCta />
      <BottomCta />
      <Footer />
    </main>
  );
}
