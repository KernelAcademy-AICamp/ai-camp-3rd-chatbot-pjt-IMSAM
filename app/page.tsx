"use client";

import { useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductSection } from "@/components/sections/ProductSection";
import { InterviewersSection } from "@/components/sections/InterviewersSection";
import { AnalyticsSection } from "@/components/sections/AnalyticsSection";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { CaseStudySection } from "@/components/sections/CaseStudySection";
import { FooterSection } from "@/components/sections/FooterSection";

export default function HomePage() {
  useEffect(() => {
    // Add dark class to html element for dark mode default
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <main>
        <HeroSection />
        <ProductSection />
        <InterviewersSection />
        <AnalyticsSection />
        <SecuritySection />
        <CaseStudySection />
      </main>
      <FooterSection />
    </div>
  );
}
