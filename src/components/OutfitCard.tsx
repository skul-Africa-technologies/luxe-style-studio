import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";

interface OutfitCardProps {
  id: string;
  image: string;
  name: string;
  price: string;
  index: number;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ 
  id, 
  image, 
  name, 
  price, 
  index 
}) => {
  const navigate = useNavigate();
  const { isItemLoved, toggleItem } = useWishlist();
  const isLoved = isItemLoved(id);

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
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500 rounded-xl">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-xl"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500 rounded-xl" />
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleItem({ id, name, price, image });
          }}
          className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors"
          aria-label={isLoved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            className={`transition-all duration-300 ${
              isLoved 
                ? "fill-red-500 text-red-500" 
                : "text-foreground"
            }`}
          />
        </motion.button>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-lg md:text-xl font-medium text-foreground tracking-wide">{name}</h3>
        <span className="font-body text-sm tracking-wider text-muted-foreground">{price}</span>
      </div>
    </motion.div>
  );
};

export default OutfitCard;
