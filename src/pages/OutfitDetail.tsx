import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ShoppingBag, Check } from "lucide-react";
import { outfits } from "@/data/outfits";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const outfit = outfits.find((o) => o.id === id);

  if (!outfit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl text-foreground">Outfit not found</h2>
          <button
            onClick={() => navigate("/#collection")}
            className="font-body text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Collection
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: outfit.id,
      name: outfit.name,
      price: outfit.price,
      image: outfit.image,
      category: outfit.category,
      style: outfit.style,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello MATTEEKAY FASHION, I want to purchase this outfit: ${outfit.name}. Price: ${outfit.price}`
  );
  const whatsappUrl = `https://wa.me/1234567890?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 md:pt-24">
        {/* Back button */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate("/#collection")}
            className="flex items-center gap-2 font-body text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            Back to Collection
          </motion.button>
        </div>

        {/* Product detail */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden bg-secondary aspect-[3/4]"
            >
              <img
                src={outfit.image}
                alt={outfit.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-8 lg:sticky lg:top-28"
            >
              <div className="space-y-4">
                <p className="font-body text-xs tracking-[0.4em] uppercase text-muted-foreground">
                  {outfit.category} — {outfit.style}
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
                  {outfit.name}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl md:text-3xl text-foreground">
                    {outfit.price}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < outfit.rating ? "fill-foreground text-foreground" : "text-border"}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-12 h-px bg-border" />

              <p className="font-body text-base leading-relaxed text-muted-foreground max-w-md">
                {outfit.description}
              </p>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Fabric</span>
                  <span className="font-body text-sm text-foreground">{outfit.fabric}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Style</span>
                  <span className="font-body text-sm text-foreground">{outfit.style}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Category</span>
                  <span className="font-body text-sm text-foreground">{outfit.category}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-4">
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-3 w-full py-4 font-body text-xs tracking-[0.3em] uppercase transition-all duration-300 ${
                    isAdded
                      ? "bg-green-700 text-white"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      Add to Cart
                    </>
                  )}
                </motion.button>

                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 w-full py-4 border border-foreground text-foreground font-body text-xs tracking-[0.3em] uppercase transition-opacity duration-300 hover:bg-foreground hover:text-background"
                >
                  Order via WhatsApp
                </motion.a>
              </div>

              <p className="font-body text-[11px] text-center text-muted-foreground tracking-wider">
                Secure checkout available. Contact us for sizing inquiries.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OutfitDetail;
