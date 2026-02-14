import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OutfitCardProps {
  id: string;
  image: string;
  name: string;
  price: string;
  initialRating: number;
  index: number;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ 
  id, 
  image, 
  name, 
  price, 
  initialRating, 
  index 
}) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (e: React.MouseEvent, newRating: number) => {
    e.stopPropagation();
    setRating(newRating);
  };

  const handleRatingHover = (hoveredRating: number) => {
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

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
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-lg md:text-xl font-medium text-foreground tracking-wide">{name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-body text-sm tracking-wider text-muted-foreground">{price}</span>
          <div 
            className="flex items-center gap-0.5"
            onMouseLeave={handleMouseLeave}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => handleRatingClick(e, i + 1)}
                onMouseEnter={() => handleRatingHover(i + 1)}
                className="focus:outline-none p-0.5 transition-transform duration-200 hover:scale-110"
                aria-label={`Rate ${i + 1} stars`}
              >
                <Star
                  size={14}
                  className={`
                    transition-colors duration-200
                    ${i < displayRating 
                      ? "fill-foreground text-foreground" 
                      : "text-border"
                    }
                    ${hoverRating > 0 && i < hoverRating ? "opacity-100" : ""}
                  `}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OutfitCard;
