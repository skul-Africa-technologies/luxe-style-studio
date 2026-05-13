import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedCollectionShowcase from "@/components/FeaturedCollectionShowcase";
import CollectionSection from "@/components/CollectionSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <HeroSection />
      <FeaturedCollectionShowcase />
      <CollectionSection />
      <AboutSection />
      <ContactSection />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
