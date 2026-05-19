import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Heart,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import { fetchOutfitById, Outfit } from "@/data/outfits";

/* ───────────────────────────────────────── */
/* Types */
/* ───────────────────────────────────────── */

interface Variant {
  id?: string;
  _id?: string;
  color?: string;
  size?: string;
  image?: string;
  stock?: number;
  price?: number;
  sku?: string;
}

interface OutfitWithVariants extends Outfit {
  variants?: Variant[];
  basePrice?: string;
}

/* ───────────────────────────────────────── */
/* Helpers */
/* ───────────────────────────────────────── */

const formatPriceFromNgn = (price?: number): string => {
  if (!price) return "₦0";
  return `₦${price.toLocaleString("en-NG")}`;
};

/* ───────────────────────────────────────── */
/* Component */
/* ───────────────────────────────────────── */

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addItem } = useCart();
  const { isItemLoved, toggleItem } = useWishlist();

  const [outfit, setOutfit] = useState<OutfitWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* MAIN PRODUCT added state */
  const [isAdded, setIsAdded] = useState(false);

  /* VARIANT added state */
  const [addedVariantId, setAddedVariantId] = useState<string | null>(null);

  const variants = Array.isArray(outfit?.variants)
    ? outfit.variants
    : [];

  const displayPrice = outfit?.price || outfit?.basePrice || "₦0";
  const displayImage = outfit?.image || "/placeholder.png";

  const isLoved = outfit ? isItemLoved(outfit.id) : false;

  /* ── FETCH ───────────────────────────── */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await fetchOutfitById(id || "");
        if (!data) throw new Error("Item not found");

        setOutfit({
          ...data,
          variants: Array.isArray(data.variants) ? data.variants : [],
          basePrice: data.price,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch outfit");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  /* ── MAIN ADD TO CART ──────────────── */

  const handleAddToCart = () => {
    if (!outfit) return;

    addItem({
      id: outfit.id,
      name: outfit.name,
      price: displayPrice,
      image: displayImage,
      category: outfit.category,
      style: outfit.style || "",
      size: "",
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(
    `Hello MATTEEKAY I want to purchase: ${outfit?.name || ""}. Price: ${displayPrice}`
  )}`;

  /* ── LOADING / ERROR ─────────────── */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading outfit...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!outfit)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Outfit not found</p>
      </div>
    );

  /* ── RENDER ───────────────────────── */

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <MobileBottomNav />

      <main className="pt-24 max-w-7xl mx-auto px-4 md:px-12 pb-24">

        {/* BACK */}
        <motion.button
          onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 mb-6 text-sm text-muted-foreground"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </motion.button>

        {/* MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* IMAGE */}
          <div className="relative aspect-[3/4] bg-secondary rounded-2xl overflow-hidden">
            <img src={displayImage} className="w-full h-full object-cover" />

            <button
              onClick={() =>
                toggleItem({
                  id: outfit.id,
                  name: outfit.name,
                  price: outfit.price,
                  image: outfit.image,
                  category: outfit.category,
                })
              }
              className="absolute top-3 right-3 p-2 bg-white/80 rounded-full"
            >
              <Heart
                size={18}
                className={
                  isLoved ? "text-red-500 fill-red-500" : ""
                }
              />
            </button>
          </div>

          {/* INFO */}
          <div className="space-y-6">
            <p className="text-xs uppercase text-muted-foreground">
              {outfit.category} — {outfit.style || "N/A"}
            </p>

            <h1 className="text-4xl font-light">{outfit.name}</h1>

            <span className="text-2xl">{displayPrice}</span>

            <p className="text-muted-foreground">{outfit.description}</p>

            {/* MAIN ADD BUTTON */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 flex items-center justify-center gap-2 uppercase text-xs tracking-widest ${
                isAdded
                  ? "bg-green-700 text-white"
                  : "bg-black text-white"
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={16} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              className="w-full py-4 border text-center uppercase text-xs block"
            >
              Order via WhatsApp
            </a>
          </div>
        </div>

        {/* VARIANTS */}
        {variants.length > 0 && (
          <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {variants.map((variant) => {
              const id = variant._id || variant.id || "";

              const outOfStock = (variant.stock ?? 0) <= 0;

              return (
                <motion.div key={id} className="border rounded-2xl overflow-hidden">

                  <img
                    src={variant.image || outfit.image}
                    className="aspect-[3/4] object-cover w-full"
                  />

                  <div className="p-4 space-y-3">

                    <h3 className="text-sm uppercase">
                      {variant.color || "Variant"}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {formatPriceFromNgn(variant.price)}
                    </p>

                    {variant.size && (
                      <span className="text-xs border px-3 py-1 rounded-xl">
                        {variant.size}
                      </span>
                    )}
<button
  disabled={outOfStock}
  onClick={() => {
    addItem({
      id,
      name: `${outfit.name} ${variant.color || ""} ${variant.size || ""}`,
      price: formatPriceFromNgn(variant.price),
      image: variant.image || outfit.image,
      category: outfit.category,
      style: outfit.style || "",
      size: variant.size || "",
    });

    setAddedVariantId(id);

    setTimeout(() => {
      setAddedVariantId(null);<button
  disabled={outOfStock}
  onClick={() => {
    addItem({
      id,
      name: `${outfit.name} ${variant.color || ""} ${variant.size || ""}`,
      price: formatPriceFromNgn(variant.price),
      image: variant.image || outfit.image,
      category: outfit.category,
      style: outfit.style || "",
      size: variant.size || "",
    });

    setAddedVariantId(id);

    setTimeout(() => {
      setAddedVariantId(null);
    }, 1500);
  }}
  className={`w-full h-12 flex items-center justify-center rounded-xl transition-all ${
    outOfStock
      ? "bg-gray-400 text-white"
      : addedVariantId === id
      ? "bg-green-700 text-white"
      : "bg-black text-white hover:bg-neutral-800"
  }`}
>
  {addedVariantId === id ? (
    <Check size={22} />
  ) : (
    <ShoppingBag size={22} />
  )}
</button>
    }, 1500);
  }}
  className={`w-full h-12 flex items-center justify-center rounded-xl transition-all ${
    outOfStock
      ? "bg-gray-400 text-white"
      : addedVariantId === id
      ? "bg-green-700 text-white"
      : "bg-black text-white hover:bg-neutral-800"
  }`}
>
  {addedVariantId === id ? (
    <Check size={22} />
  ) : (
    <ShoppingBag size={22} />
  )}
</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OutfitDetail;