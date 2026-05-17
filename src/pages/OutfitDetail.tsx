import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { fetchOutfitById } from "@/data/outfits";

interface OutfitDetailType {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  fabric?: string;
  style?: string;
  category: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isItemLoved, toggleItem } = useWishlist();

  const [outfit, setOutfit] = useState<OutfitDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const isLoved = outfit ? isItemLoved(outfit.id) : false;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOutfitById(id!);
        if (!data) throw new Error("Item not found");
        setOutfit(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch outfit");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading outfit...</p>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!outfit) return;

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    addItem({
      id: outfit.id,
      name: outfit.name,
      price: outfit.price,
      image: outfit.image,
      category: outfit.category,
      style: outfit.style || "",
      size: selectedSize,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello MATTEEKAY I want to purchase this outfit: ${outfit!.name}. Size: ${selectedSize ?? "Not selected"}. Price: ${outfit!.price}`
  );

  const whatsappUrl = `https://wa.me/1234567890?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <MobileBottomNav />

      <main className="pt-20 md:pt-24 max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to Collection
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="overflow-hidden bg-secondary aspect-[3/4] relative">
            <img
              src={outfit!.image}
              alt={outfit!.name}
              className="w-full h-full object-cover"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                toggleItem({
                  id: outfit!.id,
                  name: outfit!.name,
                  price: outfit!.price,
                  image: outfit!.image,
                  category: outfit!.category,
                })
              }
              className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors"
              aria-label={isLoved ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={18}
                className={`transition-all duration-300 ${
                  isLoved ? "fill-red-500 text-red-500" : "text-foreground"
                }`}
              />
            </motion.button>
          </div>

          {/* Info */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <p className="uppercase text-xs text-muted-foreground tracking-widest">
              {outfit!.category} — {outfit!.style || "N/A"}
            </p>

            <h1 className="text-4xl font-light">{outfit!.name}</h1>

            <span className="text-2xl">{outfit!.price}</span>

            <p className="text-muted-foreground">{outfit!.description}</p>

            {/* Size Selector */}
            <div className="space-y-3">
              <p className="uppercase text-xs tracking-widest text-muted-foreground">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`w-12 h-12 border text-xs uppercase tracking-widest transition-all duration-200 ${
                      selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-foreground border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-xs text-red-500 tracking-wide">
                  Please select a size before adding to cart
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors duration-300 ${
                  isAdded
                    ? "bg-green-700 text-white"
                    : "bg-black text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={16} /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to Cart
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 border text-center uppercase text-xs tracking-widest block hover:bg-foreground hover:text-background transition-colors duration-300"
              >
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OutfitDetail;