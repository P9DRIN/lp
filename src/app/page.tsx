import { HeroSection } from "@/components/hero-section";
import { MetricsSection } from "@/components/metrics-section";
import { CostSection } from "@/components/cost-section";
import { ServicesSection } from "@/components/services-section";
import { ProofSection } from "@/components/proof-section";
import { AuthoritySection } from "@/components/authority-section";
import { PathSection } from "@/components/path-section";
import { ObjectionsSection } from "@/components/objections-section";
import { CtaSection } from "@/components/cta-section";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <HeroSection />
        <PathSection />
        <MetricsSection />
        <CostSection />
        <ServicesSection />
        <ProofSection />
        {/* <AuthoritySection /> */}
        <ObjectionsSection />
        <CtaSection />
      </main>

      <SiteFooter />
    </>
  );
}
