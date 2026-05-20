import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check, Heart } from "lucide-react";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import { fetchOutfitById, Outfit } from "@/data/outfits";

/* ───────────────────────────────────────── */
/* Types                                     */
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
/* Helpers                                   */
/* ───────────────────────────────────────── */

const formatPriceFromNgn = (price?: number): string => {
  if (!price) return "₦0";
  return `₦${price.toLocaleString("en-NG")}`;
};

/* ───────────────────────────────────────── */
/* Main outfit add to cart (with variants)  */
/* ───────────────────────────────────────── */

const MainOutfitActions = ({
  outfit,
}: {
  outfit: OutfitWithVariants;
}) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleAdd = () => {
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

  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Main Item — Select Size
      </p>

      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => {
              setSelectedSize(size);
              setSizeError(false);
            }}
            className={`w-10 h-10 border text-xs uppercase tracking-widest transition-all duration-200 ${
              selectedSize === size
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:border-foreground"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {sizeError && (
        <p className="text-xs text-red-500">
          Please select a size
        </p>
      )}

      <button
        onClick={handleAdd}
        className={`w-full py-3 flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-colors duration-300 rounded-xl ${
          isAdded
            ? "bg-green-700 text-white"
            : "bg-black text-white hover:bg-neutral-800"
        }`}
      >
        {isAdded ? (
          <>
            <Check size={14} /> Added
          </>
        ) : (
          <>
            <ShoppingBag size={14} /> Add Main Item to Cart
          </>
        )}
      </button>
    </div>
  );
};

/* ───────────────────────────────────────── */
/* No-variant layout (single product view)  */
/* ───────────────────────────────────────── */

const SingleProductView = ({
  outfit,
  isLoved,
  onToggleWishlist,
}: {
  outfit: OutfitWithVariants;
  isLoved: boolean;
  onToggleWishlist: () => void;
}) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleAddToCart = () => {
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

  const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(
    `Hello MATTEEKAY I want to purchase: ${outfit.name}. Size: ${
      selectedSize || "N/A"
    }. Price: ${outfit.price}`
  )}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="relative aspect-[3/4] bg-secondary rounded-2xl overflow-hidden">
        <img
          src={outfit.image}
          alt={outfit.name}
          className="w-full h-full object-cover"
        />

        <button
          onClick={onToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full"
        >
          <Heart
            size={18}
            className={isLoved ? "text-red-500 fill-red-500" : ""}
          />
        </button>
      </div>

      <div className="space-y-6 lg:sticky lg:top-28">
        <p className="text-xs uppercase text-muted-foreground">
          {outfit.category} — {outfit.style || "N/A"}
        </p>

        <h1 className="text-4xl font-light">{outfit.name}</h1>

        <span className="text-2xl">{outfit.price}</span>

        <p className="text-muted-foreground">{outfit.description}</p>

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
            <p className="text-xs text-red-500">
              Please select a size before adding to cart
            </p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-colors duration-300 ${
              isAdded
                ? "bg-green-700 text-white"
                : "bg-black text-white hover:bg-neutral-800"
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
  );
};

/* ───────────────────────────────────────────────── */
/* Variant card — DESKTOP                            */
/* ───────────────────────────────────────────────── */

const VariantCardDesktop = ({
  variant,
  outfit,
}: {
  variant: Variant;
  outfit: OutfitWithVariants;
}) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const variantId = variant._id || variant.id || "";
  const outOfStock = (variant.stock ?? 0) <= 0;
  const variantPrice = formatPriceFromNgn(variant.price);
  const variantImage = variant.image || outfit.image;

  const handleAdd = () => {
    if (outOfStock) return;

    addItem({
      id: variantId,
      name: `${outfit.name}${
        variant.color ? " — " + variant.color : ""
      }${variant.size ? " / " + variant.size : ""}`,
      price: variantPrice,
      image: variantImage,
      category: outfit.category,
      style: outfit.style || "",
      size: variant.size || "",
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(
    `Hello MATTEEKAY I want to purchase: ${outfit.name}${
      variant.color ? " — " + variant.color : ""
    }${
      variant.size ? " / Size: " + variant.size : ""
    }. Price: ${variantPrice}`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-2xl overflow-hidden bg-card"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={variantImage}
          alt={variant.color || outfit.name}
          className="w-full h-full object-cover"
        />

        {outOfStock && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {variant.color && (
          <h3 className="text-sm uppercase tracking-widest font-medium">
            {variant.color}
          </h3>
        )}

        {variant.size && (
          <span className="inline-block text-xs border px-3 py-1 rounded-xl">
            {variant.size}
          </span>
        )}

        <p className="text-sm font-medium">{variantPrice}</p>

        {variant.stock !== undefined && !outOfStock && (
          <p className="text-xs text-green-600">
            {variant.stock} in stock
          </p>
        )}

        <button
          disabled={outOfStock}
          onClick={handleAdd}
          className={`w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl uppercase text-xs tracking-widest transition-all duration-300 ${
            outOfStock
              ? "bg-neutral-300 text-white cursor-not-allowed"
              : isAdded
              ? "bg-green-700 text-white"
              : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={14} /> Added
            </>
          ) : outOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingBag size={14} /> Add to Cart
            </>
          )}
        </button>

        {!outOfStock && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 mt-1 flex items-center justify-center border rounded-xl uppercase text-xs tracking-widest hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            WhatsApp
          </a>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────── */
/* Variant card — MOBILE (horizontal, icon-only button)   */
/* ─────────────────────────────────────────────────────── */

const VariantCardMobile = ({
  variant,
  outfit,
}: {
  variant: Variant;
  outfit: OutfitWithVariants;
}) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const variantId = variant._id || variant.id || "";
  const outOfStock = (variant.stock ?? 0) <= 0;
  const variantPrice = formatPriceFromNgn(variant.price);
  const variantImage = variant.image || outfit.image;

  const handleAdd = () => {
    if (outOfStock) return;

    addItem({
      id: variantId,
      name: `${outfit.name}${
        variant.color ? " — " + variant.color : ""
      }${variant.size ? " / " + variant.size : ""}`,
      price: variantPrice,
      image: variantImage,
      category: outfit.category,
      style: outfit.style || "",
      size: variant.size || "",
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 border rounded-2xl overflow-hidden bg-card p-3"
    >
      <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-secondary">
        <img
          src={variantImage}
          alt={variant.color || outfit.name}
          className="w-full h-full object-cover"
        />

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[9px] text-center px-1">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        {variant.color && (
          <p className="text-sm uppercase tracking-widest font-medium truncate">
            {variant.color}
          </p>
        )}

        {variant.size && (
          <span className="inline-block text-xs border px-2 py-0.5 rounded-lg">
            {variant.size}
          </span>
        )}

        <p className="text-sm font-medium">{variantPrice}</p>

        {variant.stock !== undefined && !outOfStock && (
          <p className="text-xs text-green-600">
            {variant.stock} in stock
          </p>
        )}
      </div>

      <button
        disabled={outOfStock}
        onClick={handleAdd}
        className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 ${
          outOfStock
            ? "bg-neutral-300 text-white cursor-not-allowed"
            : isAdded
            ? "bg-green-700 text-white"
            : "bg-black text-white hover:bg-neutral-800"
        }`}
      >
        {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
      </button>
    </motion.div>
  );
};

/* ───────────────────────────────────────── */
/* Main component                            */
/* ───────────────────────────────────────── */

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isItemLoved, toggleItem } = useWishlist();

  const [outfit, setOutfit] = useState<OutfitWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const variants = Array.isArray(outfit?.variants)
    ? outfit.variants
    : [];

  const hasVariants = variants.length > 0;
  const isLoved = outfit ? isItemLoved(outfit.id) : false;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await fetchOutfitById(id || "");

        if (!data) throw new Error("Item not found");

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
            : "Failed to fetch outfit"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

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

  const handleToggleWishlist = () => {
    toggleItem({
      id: outfit.id,
      name: outfit.name,
      price: outfit.price,
      image: outfit.image,
      category: outfit.category,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <MobileBottomNav />

      <main className="pt-24 max-w-7xl mx-auto px-4 md:px-12 pb-24">
        {/* BACK */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </motion.button>

        {/* NO VARIANTS — classic layout */}
        {!hasVariants && (
          <SingleProductView
            outfit={outfit}
            isLoved={isLoved}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* HAS VARIANTS */}
        {hasVariants && (
          <>
            {/* ── DESKTOP ── */}
            <div className="hidden md:grid md:grid-cols-[1fr_2fr] gap-10">
              {/* Main outfit image sticky left */}
              <div className="self-start lg:sticky lg:top-28 space-y-4">
                <div className="relative aspect-[3/4] bg-secondary rounded-2xl overflow-hidden">
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={handleToggleWishlist}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full"
                  >
                    <Heart
                      size={18}
                      className={isLoved ? "text-red-500 fill-red-500" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Right: header + variant grid */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-muted-foreground tracking-widest">
                    {outfit.category} — {outfit.style || "N/A"}
                  </p>

                  <h1 className="text-3xl md:text-4xl font-light">
                    {outfit.name}
                  </h1>

                  <p className="text-muted-foreground text-sm max-w-xl">
                    {outfit.description}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {variants.length} variant
                    {variants.length !== 1 ? "s" : ""} available
                  </p>

                  <MainOutfitActions outfit={outfit} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {variants.map((variant) => (
                    <VariantCardDesktop
                      key={variant._id || variant.id}
                      variant={variant}
                      outfit={outfit}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── MOBILE ── */}
            <div className="md:hidden space-y-3">
              {/* Main outfit image */}
              <div className="relative aspect-[4/3] bg-secondary rounded-2xl overflow-hidden">
                <img
                  src={outfit.image}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={handleToggleWishlist}
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full"
                >
                  <Heart
                    size={18}
                    className={isLoved ? "text-red-500 fill-red-500" : ""}
                  />
                </button>
              </div>

              {/* Header */}
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground tracking-widest">
                  {outfit.category} — {outfit.style || "N/A"}
                </p>

                <h1 className="text-2xl font-light">
                  {outfit.name}
                </h1>

                <p className="text-muted-foreground text-sm">
                  {outfit.description}
                </p>

                <p className="text-xs text-muted-foreground">
                  {variants.length} variant
                  {variants.length !== 1 ? "s" : ""} available
                </p>
              </div>

              <MainOutfitActions outfit={outfit} />

              {/* Variant list */}
              <div className="flex flex-col gap-3">
                {variants.map((variant) => (
                  <VariantCardMobile
                    key={variant._id || variant.id}
                    variant={variant}
                    outfit={outfit}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OutfitDetail;