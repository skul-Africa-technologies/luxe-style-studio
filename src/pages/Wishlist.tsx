import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { fetchOutfits, type Outfit } from "@/data/outfits";
import MobileBottomNav from "@/components/MobileBottomNav";
import { glassStyle, glassBubbleStyle, glassCardStyle } from "@/lib/glass";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  exit: { opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.3 } },
};

const Wishlist = () => {
  const navigate = useNavigate();
  const { state, removeItem, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const { items } = state;
  const reduced = useReducedMotion();

  const [gallery, setGallery] = useState<Outfit[]>([]);

  useEffect(() => {
    fetchOutfits(1, 12)
      .then((products) => setGallery(products))
      .catch(() => setGallery([]));
  }, []);

  const lovedIds = new Set(items.map((item) => item.id));

  const galleryProducts = gallery
    .filter((p) => !lovedIds.has(p.id))
    .slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf7f3]">
      {/* Backdrop blobs behind content */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div
          className="absolute top-[-12%] left-[-8%] w-[700px] h-[700px] rounded-full bg-gold/12 blur-3xl"
        />
        <div
          className="absolute bottom-[-18%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#0a0a0a]/10 blur-3xl"
        />
        <div
          className="absolute top-[-22%] right-[-14%] w-[540px] h-[540px] rounded-full bg-[#fdfaf8]/22 blur-3xl"
        />
      </div>

      <MobileBottomNav />

      <header className="pt-20 md:pt-24 max-w-7xl mx-auto px-6 md:px-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-foreground shrink-0"
            aria-label="Back"
            style={glassBubbleStyle}
          >
            <ArrowLeft size={17} />
          </motion.button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-4xl md:text-6xl font-light text-foreground tracking-tight">
                Loved Collection
              </h1>
              {items.length > 0 && (
                <span
                  className="flex h-6 w-6 min-w-6 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-body font-semibold px-1.5 leading-none"
                  aria-label={`${items.length} saved items`}
                >
                  {items.length}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground tracking-wider font-body">
              Pieces you adore, saved for later
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {items.length === 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center min-h-[55vh] py-12"
            >
              <div
                style={glassStyle}
                className="rounded-[28px] md:rounded-[32px] p-8 md:p-12 max-w-xs w-full text-center mx-auto"
              >
                <div className="flex justify-center mb-6">
                  <div
                    className="h-14 w-14 md:h-18 md:w-18 rounded-full flex items-center justify-center relative"
                    style={glassBubbleStyle}
                  >
                    <motion.div
                      className="h-full w-full flex items-center justify-center rounded-full overflow-hidden"
                      animate={reduced ? {} : { y: [0, -8, 0] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Heart
                        size={30}
                        className="text-foreground drop-shadow-[0_0_16px_rgba(0,0,0,0.10)]"
                      />
                    </motion.div>
                  </div>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-light text-foreground mb-2">
                  Your collection is empty
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-8 px-4 md:px-0 leading-relaxed">
                  Tap the heart icon on any piece to save it here.
                </p>
                <Link to="/#collection">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mx-auto inline-flex items-center gap-2 px-10 py-3.5 rounded-full bg-foreground text-background font-body text-xs tracking-wider uppercase"
                  >
                    Explore Collection <ArrowRight size={16} />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            <section className="mt-12 md:mt-16">
              <h3 className="font-display text-xl md:text-2xl font-light text-foreground mb-6 tracking-tight">
                You might love
              </h3>
              <div
                className="flex gap-4 snap-x sm:snap-none scroll-snap-type mandatory overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {galleryProducts.map((product) => {
                  const isLoved = lovedIds.has(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-none w-[270px] md:w-[320px] snap-start sm:snap-none group cursor-pointer"
                      onClick={() => navigate(`/outfit/${product.id}`)}
                    >
                      <div
                        style={glassCardStyle}
                        className="rounded-[20px] overflow-hidden relative"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-56 md:h-72 object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(product);
                          }}
                          className="absolute top-3 right-3 p-2 bg-background/85 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors"
                          aria-label={isLoved ? "Remove from wishlist" : "Add to wishlist"}
                          disabled={isLoved}
                        >
                          <Heart
                            size={18}
                            className={`transition-all duration-300 ${
                              isLoved ? "fill-red-500 text-red-500" : "text-foreground"
                            }`}
                          />
                        </motion.button>
                      </div>
                      <div className="mt-4">
                        <h3 className="font-display text-base font-medium text-foreground leading-tight">
                          {product.name}
                        </h3>
                        <span className="font-body text-sm text-muted-foreground tracking-wider">
                          {product.price}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {items.map((item) => (
                <motion.div
                  variants={itemVariants}
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/outfit/${item.id}`)}
                >
                  <div className="aspect-[3/4] overflow-hidden relative mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-foreground text-background rounded-full flex items-center justify-center"
                      aria-label="Remove from wishlist"
                      style={{
                        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                      }}
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-medium text-foreground leading-tight">
                      {item.name}
                    </h3>
                    <span className="font-body text-sm text-muted-foreground tracking-wider">
                      {item.price}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                      });
                    }}
                    className="w-full py-3 rounded-full bg-foreground text-background font-body text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    Add to cart <ArrowRight size={15} />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
