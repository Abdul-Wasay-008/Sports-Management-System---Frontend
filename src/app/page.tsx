import { AudienceSection } from "@/components/landing/AudienceSection";
import { CTASection } from "@/components/landing/CTASection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { OrganizerSection } from "@/components/landing/OrganizerSection";
import { VisualBreak } from "@/components/landing/VisualBreak";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <AudienceSection />
        <VisualBreak />
        <FeatureSection />
        <OrganizerSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
