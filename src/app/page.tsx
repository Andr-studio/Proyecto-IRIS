// page.tsx — Server Component (root)
// Client-side interactivity is delegated to child components via "use client"
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import BentoFeatures from "@/components/landing/BentoFeatures";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <BentoFeatures />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
