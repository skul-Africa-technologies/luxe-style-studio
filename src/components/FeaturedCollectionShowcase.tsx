import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slideshow {
  id: string;
  imageUrl: string;
  title: string;
  displayText?: string;
  order?: number;
  isActive?: boolean;
}

const FeaturedCollectionShowcase = () => {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const loadSlideshows = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/slideshow`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch slideshows: ${response.status}`);
        }

        const data = await response.json();

        const items: Slideshow[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];

        const active = items
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setSlideshows(active);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch slideshows.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSlideshows();
  }, []);

  useEffect(() => {
    if (loading || error || slideshows.length === 0) return;

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slideshows.length);
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, error, slideshows.length, isPaused]);

  const goToSlide = (index: number) => setCurrentIndex(index);

  const goToPrevious = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + slideshows.length) % slideshows.length,
    );

  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % slideshows.length);

  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.targetTouches[0].clientX);

  const handleTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) goToNext();
    if (touchStart - touchEnd < -50) goToPrevious();
  };

  if (loading) {
    return (
      <section className="pt-24 pb-12 md:pt-44 md:pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="relative h-[160px] sm:h-[220px] md:h-[500px] bg-secondary/30 animate-pulse rounded-[2rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent animate-pulse" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-24 pb-12 md:pt-44 md:pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-red-500">{error}</p>
      </section>
    );
  }

  if (slideshows.length === 0) {
    return (
      <section className="pt-24 pb-12 md:pt-44 md:pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-muted-foreground">
          No slideshow images available yet.
        </p>
      </section>
    );
  }

  const current = slideshows[currentIndex];

  return (
    <section
      id="collection"
      className="pt-24 pb-12 md:pt-44 md:pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative">
        <div
          className="relative h-[160px] sm:h-[220px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={current.imageUrl}
                alt={current.title}
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />

              <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-transparent to-foreground/30" />

              <div className="absolute inset-0 rounded-[2rem] md:rounded-[3rem] border border-white/10" />

           <div className="absolute bottom-0 left-0 right-0 pl-20 sm:pl-24 md:pl-28 pr-4 sm:pr-6 md:pr-12 pb-4 sm:pb-6 md:pb-12 lg:pb-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <h3 className="font-display text-lg sm:text-2xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider mb-2 md:mb-4">
                    {current.title}
                  </h3>

                  {current.displayText && (
                    <p className="font-body text-xs sm:text-sm md:text-base text-white/80 mb-4 md:mb-6 max-w-md">
                      {current.displayText}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={goToPrevious}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex justify-center mt-6 md:mt-8 gap-3">
          {slideshows.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 md:w-10 h-2 bg-foreground"
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