import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check, Heart } from "lucide-react";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import { fetchOutfitById, Outfit } from "@/data/outfits";

/* ────────────────────────────────────────────────────────────────────────── */
/* Types */
/* ────────────────────────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers */
/* ────────────────────────────────────────────────────────────────────────── */

const extractColors = (variants: Variant[]): string[] =>
  [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];

const extractSizes = (
  variants: Variant[],
  color?: string,
): string[] => {
  const relevant = color
    ? variants.filter((v) => v.color === color)
    : variants;

  return [...new Set(relevant.map((v) => v.size).filter(Boolean))] as string[];
};

const findVariant = (
  variants: Variant[],
  color?: string,
  size?: string,
): Variant | undefined => {
  if (!variants || variants.length === 0) return undefined;

  const exact = variants.find(
    (v) => v.color === color && v.size === size,
  );

  if (exact) return exact;

  if (color) {
    const colorOnly = variants.find((v) => v.color === color);
    if (colorOnly) return colorOnly;
  }

  return variants[0];
};

const formatPriceFromNgn = (price?: number): string => {
  if (!price) return "₦0";

  return `₦${price.toLocaleString("en-NG")}`;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Component */
/* ────────────────────────────────────────────────────────────────────────── */

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { addItem } = useCart();
  const { isItemLoved, toggleItem } = useWishlist();

  /* ── State ───────────────────────────────────────────────────────────── */

  const [outfit, setOutfit] =
    useState<OutfitWithVariants | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [isAdded, setIsAdded] = useState(false);

  const [selectedColor, setSelectedColor] = useState("");

  const [selectedSize, setSelectedSize] = useState("");

  const [sizeError, setSizeError] = useState(false);

  /* ── Safe variants ───────────────────────────────────────────────────── */

  const variants = Array.isArray(outfit?.variants)
    ? outfit.variants
    : [];

  /* ── Derived ─────────────────────────────────────────────────────────── */

  const availableColors = useMemo(
    () => extractColors(variants),
    [variants],
  );

  const availableSizes = useMemo(
    () => extractSizes(variants, selectedColor),
    [variants, selectedColor],
  );

  const resolvedVariant = useMemo(() => {
    return findVariant(
      variants,
      selectedColor || variants?.[0]?.color,
      selectedSize || variants?.[0]?.size,
    );
  }, [variants, selectedColor, selectedSize]);

  /* ───────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!variants.length) return;

    const firstVariant = variants[0];

    if (!selectedColor && firstVariant?.color) {
      setSelectedColor(firstVariant.color);
    }

    if (!selectedSize && firstVariant?.size) {
      setSelectedSize(firstVariant.size);
    }
  }, [variants, selectedColor, selectedSize]);

  useEffect(() => {
    if (!selectedColor) return;

    const sizes = extractSizes(variants, selectedColor);

    if (sizes.length > 0 && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
  }, [selectedColor, variants, selectedSize]);

  /* ── Display values ──────────────────────────────────────────────────── */

  const displayPrice =
    resolvedVariant?.price != null
      ? formatPriceFromNgn(resolvedVariant.price)
      : outfit?.basePrice ||
        outfit?.price ||
        "₦0";

  const displayImage =
    resolvedVariant?.image ||
    outfit?.image ||
    "/placeholder.png";

  const displayStock = resolvedVariant?.stock ?? 0;

  const isOutOfStock =
    variants.length > 0 && displayStock <= 0;

  const isLoved = outfit
    ? isItemLoved(outfit.id)
    : false;

  /* ── Fetch ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await fetchOutfitById(id || "");

        if (!data) {
          throw new Error("Item not found");
        }

        setOutfit({
          ...data,
          variants: Array.isArray(data.variants)
            ? data.variants
            : [],
          basePrice: data.price,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch outfit",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  /* ── Actions ─────────────────────────────────────────────────────────── */

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSizeError(false);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError(false);
  };

  const handleAddToCart = () => {
    if (!outfit) return;

    if (variants.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }

    addItem({
      id: outfit.id,
      name: outfit.name,
      price: displayPrice,
      image: displayImage,
      category: outfit.category,
      style: outfit.style || "",
      size: selectedSize || "",
    });

    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  /* ───────────────────────────────────────────────────────────────────── */

  const whatsappMessage = encodeURIComponent(
    `Hello MATTEEKAY I want to purchase this outfit: ${outfit?.name || ""}. Color: ${selectedColor || "N/A"}. Size: ${selectedSize || "N/A"}. Price: ${displayPrice}`,
  );

  const whatsappUrl = `https://wa.me/1234567890?text=${whatsappMessage}`;

  /* ── Loading ─────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading outfit...</p>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  /* ── Empty ───────────────────────────────────────────────────────────── */

  if (!outfit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Outfit not found</p>
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <MobileBottomNav />

      <main className="pt-24 max-w-7xl mx-auto px-4 md:px-12 pb-24">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* IMAGE */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden bg-secondary aspect-[3/4] relative rounded-2xl"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={displayImage}
                src={displayImage}
                alt={outfit.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                toggleItem({
                  id: outfit.id,
                  name: outfit.name,
                  price: outfit.price,
                  image: outfit.image,
                  category: outfit.category,
                })
              }
              className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full"
            >
              <Heart
                size={18}
                className={
                  isLoved
                    ? "fill-red-500 text-red-500"
                    : "text-foreground"
                }
              />
            </motion.button>

            {isOutOfStock && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                Out of Stock
              </div>
            )}
          </motion.div>

          {/* INFO */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <p className="uppercase text-xs text-muted-foreground tracking-widest">
              {outfit.category} — {outfit.style || "N/A"}
            </p>

            <h1 className="text-4xl font-light">
              {outfit.name}
            </h1>

            <div>
              <span className="text-2xl">
                {displayPrice}
              </span>
            </div>

            <p className="text-muted-foreground">
              {outfit.description}
            </p>

            {/* COLORS */}

            {availableColors.length > 0 && (
              <div className="space-y-3">
                <p className="uppercase text-xs tracking-widest text-muted-foreground">
                  Color
                </p>

                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        handleColorSelect(color)
                      }
                      className={`px-4 py-2 border text-xs uppercase tracking-widest ${
                        selectedColor === color
                          ? "bg-foreground text-background border-foreground"
                          : "border-border"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZES */}

            <div className="space-y-3">
              <p className="uppercase text-xs tracking-widest text-muted-foreground">
                Size
              </p>

              <div className="flex flex-wrap gap-2">
                {(variants.length > 0
                  ? availableSizes
                  : ["XS", "S", "M", "L", "XL"]
                ).map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      handleSizeSelect(size)
                    }
                    className={`w-12 h-12 border text-xs ${
                      selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {resolvedVariant && (
                <p className="text-xs">
                  {isOutOfStock ? (
                    <span className="text-red-500">
                      Out of stock
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {displayStock} in stock
                    </span>
                  )}
                </p>
              )}

              {sizeError && (
                <p className="text-xs text-red-500">
                  Please select a size
                </p>
              )}
            </div>

            {/* BUTTONS */}

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-4 uppercase text-xs tracking-widest flex items-center justify-center gap-2 ${
                  isAdded
                    ? "bg-green-700 text-white"
                    : isOutOfStock
                    ? "bg-neutral-500 text-white"
                    : "bg-black text-white hover:bg-neutral-800"
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
                    {isOutOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 border text-center uppercase text-xs tracking-widest block hover:bg-foreground hover:text-background"
                >
                  Order via WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OutfitDetail;