import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ShoppingBag, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { fetchOutfitById } from "@/data/outfits";

interface OutfitDetailType {
  id: string;
  name: string;
  price: string;
  image: string;
  rating: number;
  description: string;
  fabric?: string;
  style?: string;
  category: string;
}

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [outfit, setOutfit] = useState<OutfitDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdded, setIsAdded] = useState(false);

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

    addItem({
      id: outfit.id,
      name: outfit.name,
      price: outfit.price,
      image: outfit.image,
      category: outfit.category,
      style: outfit.style || "",
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello MATTEEKAY I want to purchase this outfit: ${outfit!.name}. Price: ${outfit!.price}`
  );

  const whatsappUrl = `https://wa.me/1234567890?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
          <div className="overflow-hidden bg-secondary aspect-[3/4]">
            <img
              src={outfit!.image}
              alt={outfit!.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <p className="uppercase text-xs text-muted-foreground tracking-widest">
              {outfit!.category} — {outfit!.style || "N/A"}
            </p>

            <h1 className="text-4xl font-light">{outfit!.name}</h1>

            <div className="flex items-center gap-4">
              <span className="text-2xl">{outfit!.price}</span>

              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < outfit!.rating
                        ? "fill-black text-black"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            </div>

            <p className="text-muted-foreground">{outfit!.description}</p>

            {/* Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 uppercase text-xs tracking-widest flex items-center justify-center gap-2 ${
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
                className="w-full py-4 border text-center uppercase text-xs tracking-widest block"
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