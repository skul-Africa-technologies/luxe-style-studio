import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchOutfits, Outfit } from "../data/outfits";

interface CollectionBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tagline: string;
  cta: string;
  category: string;
}

const FeaturedCollectionShowcase = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const data = await fetchOutfits(1, 6);
        setOutfits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };
    loadOutfits();
  }, []);

  const collectionBanners: CollectionBanner[] = outfits.map((outfit, idx) => ({
    id: outfit.id,
    title: outfit.name.toUpperCase(),
    subtitle: outfit.category,
    image: outfit.image,
    tagline: outfit.description,
    cta: "Explore Collection",
    category: outfit.category,
  }));

  useEffect(() => {
    if (loading || error || collectionBanners.length === 0) return;

    if (!isPaused) {
timerRef.current = setInterval(() => {
         setCurrentIndex((prev) => (prev + 1) % collectionBanners.length);
       }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, error, collectionBanners.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + collectionBanners.length) % collectionBanners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % collectionBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      goToNext();
    }
    if (touchStart - touchEnd < -50) {
      goToPrevious();
    }
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="relative h-[400px] md:h-[500px] bg-secondary/30 animate-pulse rounded-[2rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent animate-pulse" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-red-500">{error}</p>
      </section>
    );
  }

  if (collectionBanners.length === 0) {
    return null;
  }

  const currentBanner = collectionBanners[currentIndex];

  return (
    <section
      id="collection"
      className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-wider mb-2">
          Featured Collection
        </h2>
        <div className="w-16 h-px bg-foreground/30 mx-auto" />
      </motion.div>

      <div className="relative">
        <div
          className="relative h-[400px] sm:h-[450px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-transparent to-foreground/30" />

              <div className="absolute inset-0 rounded-[2rem] md:rounded-[3rem] border border-white/10" />

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <span className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70 mb-2 block">
                    {currentBanner.subtitle}
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider mb-4">
                    {currentBanner.title}
                  </h3>
                  <p className="font-body text-sm md:text-base text-white/80 mb-6 max-w-md">
                    {currentBanner.tagline}
                  </p>
                  <button className="font-body text-xs tracking-[0.2em] uppercase px-8 py-3 border border-white/60 text-white hover:bg-white hover:text-foreground transition-all duration-500 rounded-full">
                    {currentBanner.cta}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Previous collection"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Next collection"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex justify-center mt-8 gap-3">
          {collectionBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-10 h-2 bg-foreground"
                  : "w-2 h-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionShowcase;