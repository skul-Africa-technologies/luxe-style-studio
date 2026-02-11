import { motion } from "framer-motion";
import OutfitCard from "./OutfitCard";
import { outfits } from "@/data/outfits";

const CollectionSection = () => {
  return (
    <section id="collection" className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-16 md:mb-20"
      >
        <p className="font-body text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">
          Spring / Summer 2026
        </p>
        <h2 className="font-display text-4xl md:text-6xl font-light text-foreground">
          The Collection
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {outfits.map((outfit, index) => (
          <OutfitCard key={outfit.id} {...outfit} index={index} />
        ))}
      </div>
    </section>
  );
};

export default CollectionSection;
