import Navbar from "@/components/Navbar";
import SlideshowSection from "@/components/SlideshowSection";
import FeaturedCollectionShowcase from "@/components/FeaturedCollectionShowcase";
import CollectionSection from "@/components/CollectionSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <FeaturedCollectionShowcase />
      <CollectionSection />
      <ContactSection />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
