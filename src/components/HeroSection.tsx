import { motion } from "framer-motion";
import heroImage from "@/assets/hero-fashion.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Avant-garde couture fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-body text-xs md:text-sm tracking-[0.4em] uppercase text-primary-foreground/80 mb-4"
        >
          Haute Couture — Spring / Summer 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-brand text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-primary-foreground tracking-[0.12em]"
        >
          MATTEEKAY
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="font-brand text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-primary-foreground/90 tracking-[0.3em] mt-1"
        >
          FASHION
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="font-display text-lg md:text-2xl italic font-light text-primary-foreground/90 mt-4 mb-10"
        >
          Where elegance meets the extraordinary
        </motion.p>

      <motion.a
          href="#collection"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="font-body text-xs tracking-[0.3em] uppercase px-10 py-4 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-500"
        >
          View Collection
        </motion.a>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-1/4 left-[10%] w-px h-32 bg-primary-foreground/20 hidden md:block"
      />
      <motion.div
        animate={{ y: [0, 15, 0], opacity: [0.1, 0.25, 0.1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-1/3 right-[8%] w-px h-24 bg-primary-foreground/20 hidden md:block"
      />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground/60">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-primary-foreground/40"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
