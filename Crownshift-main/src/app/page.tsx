import Header from "@/components/header";
import HeroSection from "@/components/sections/hero";
import QuoteGeneratorSection from "@/components/sections/quote-generator";
import { OffersCarousel } from "@/components/offers-carousel";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <OffersCarousel />
        <QuoteGeneratorSection />
      </main>
      <Footer />
    </div>
  );
}
