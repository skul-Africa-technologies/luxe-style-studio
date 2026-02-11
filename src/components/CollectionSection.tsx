import { motion } from "framer-motion";
import OutfitCard from "./OutfitCard";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";
import outfit4 from "@/assets/outfit-4.jpg";
import outfit5 from "@/assets/outfit-5.jpg";
import outfit6 from "@/assets/outfit-6.jpg";

const outfits = [
  { image: outfit1, name: "Noir Satin Gown", price: "$4,200", rating: 5 },
  { image: outfit2, name: "Ivory Tailored Suit", price: "$3,800", rating: 4 },
  { image: outfit3, name: "Gold Silk Drape", price: "$5,600", rating: 5 },
  { image: outfit4, name: "Structured Blazer", price: "$2,900", rating: 4 },
  { image: outfit5, name: "Classic Trench", price: "$3,200", rating: 5 },
  { image: outfit6, name: "Sequin Evening Dress", price: "$6,100", rating: 5 },
];

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
          <OutfitCard key={outfit.name} {...outfit} index={index} />
        ))}
      </div>
    </section>
  );
};

export default CollectionSection;
