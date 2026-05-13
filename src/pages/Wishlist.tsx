import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import MobileBottomNav from "@/components/MobileBottomNav";

const Wishlist = () => {
  const navigate = useNavigate();
  const { state, removeItem } = useWishlist();
  const { items } = state;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileBottomNav />
      <header className="pt-20 md:pt-24 max-w-7xl mx-auto px-6 md:px-12 pb-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back
        </motion.button>
        <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
          Loved Collection
        </h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Heart size={64} className="text-muted-foreground/30 mb-6" />
            <h2 className="font-display text-2xl text-foreground mb-3">
              Your collection is empty
            </h2>
            <p className="font-body text-muted-foreground mb-8 max-w-md">
              Start adding items to your loved collection by tapping the heart icon on any piece you adore.
            </p>
            <Link
              to="/#collection"
              className="inline-flex items-center gap-2 px-8 py-3 border border-foreground text-foreground font-body text-xs tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              Explore Collection
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500 rounded-xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-xl"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500 rounded-xl" />
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Heart
                      size={18}
                      className="fill-red-500 text-red-500"
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-lg font-medium text-foreground">
                    {item.name}
                  </h3>
                  <span className="font-body text-sm tracking-wider text-muted-foreground">
                    {item.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;