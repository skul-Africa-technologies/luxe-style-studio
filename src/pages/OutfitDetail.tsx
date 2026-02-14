import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ShoppingBag, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import axios from "axios";

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
    const fetchOutfit = async () => {
      try {
        const res = await axios.get("http://localhost:3001/items", {
          params: { page: 1, limit: 50 }, // you can paginate better
        });

        const found = res.data.data.find((item: any) => item._id === id);
        if (!found) {
          setError("Outfit not found");
        } else {
          setOutfit({
            id: found._id,
            name: found.name,
            price: `$${found.price.toFixed(2)}`,
            image: found.imageUrl,
            rating: Math.floor(Math.random() * 5) + 1,
            description: found.description,
            fabric: found.fabric,
            style: found.style,
            category: found.category,
          });
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch outfit");
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading outfit...</p>;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

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
          transition={{ duration: 0.4 }}
          onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 font-body text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300 mb-6"
        >
          <ArrowLeft size={16} /> Back to Collection
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden bg-secondary aspect-[3/4]"
          >
            <img
              src={outfit!.image}
              alt={outfit!.name}
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
                {outfit!.category} — {outfit!.style || "N/A"}
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
                {outfit!.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="font-display text-2xl md:text-3xl text-foreground">
                  {outfit!.price}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < outfit!.rating ? "fill-foreground text-foreground" : "text-border"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="font-body text-base leading-relaxed text-muted-foreground max-w-md">
              {outfit!.description}
            </p>

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
                    <Check size={16} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to Cart
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
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OutfitDetail;
