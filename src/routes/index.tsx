import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Showcase } from "@/components/landing/Showcase";
import { ModulesGrid } from "@/components/landing/ModulesGrid";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { CtaFinal, SiteFooter } from "@/components/landing/CtaFinal";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <Showcase />
        <ModulesGrid />
        <Pricing />
        <Faq />
        <CtaFinal />
      </main>
      <SiteFooter />
    </div>
  );
}
