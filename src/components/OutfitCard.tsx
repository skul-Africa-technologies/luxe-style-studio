import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OutfitCardProps {
  id: string;
  image: string;
  name: string;
  price: string;
  rating: number;
  index: number;
}

const OutfitCard = ({ id, image, name, price, rating, index }: OutfitCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group cursor-pointer"
      style={{ willChange: "transform" }}
      onClick={() => navigate(`/outfit/${id}`)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="font-display text-lg md:text-xl font-medium text-foreground tracking-wide">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-body text-sm tracking-wider text-muted-foreground">
            {price}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < rating ? "fill-foreground text-foreground" : "text-border"}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OutfitCard;
