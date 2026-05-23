import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check, Heart, X, Package } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import { fetchOutfitById, Outfit } from "@/data/outfits";

const WHATSAPP_NUMBER = "2349036219219";

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
  color?: string;
  size?: string;
  stock?: number;
}

const formatPriceFromNgn = (price?: number): string => {
  if (!price) return "₦0";
  return `₦${price.toLocaleString("en-NG")}`;
};

const buildWhatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const toStockNumber = (val: unknown): number | undefined => {
  if (val === undefined || val === null) return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
};

const StockText = ({ stock }: { stock?: number }) => {
  if (stock === undefined || stock === null) return null;

  return (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <Package size={11} />
      {stock <= 0 ? "Out of stock" : `${stock} in stock`}
    </p>
  );
};

/* ─────────────────────────────────────── */
/* Color Notice Modal                      */
/* ─────────────────────────────────────── */



/* ─────────────────────────────────────────────────────────────────
   MainOutfitActions
─────────────────────────────────────────────────────────────────── */

const MainOutfitActions = ({
  outfit,
}: {
  outfit: OutfitWithVariants;
}) => {
  const { addItem } = useCart();

  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];

  const stockNum = toStockNumber(outfit.stock);
  const outOfStock = stockNum !== undefined && stockNum <= 0;

  const handleAdd = () => {
    if (outOfStock) return;

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
      color: outfit.color || "",
    });

    setIsAdded(true);

    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsappOrder = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    const whatsappUrl = buildWhatsappUrl(
      `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
        `🛍️ *Item:* ${outfit.name}\n` +
        `📦 *Category:* ${outfit.category || "N/A"}\n` +
        `📐 *Size:* ${selectedSize}\n` +
        `🎨 *Color:* ${outfit.color || "N/A"}\n` +
        `💰 *Price:* ${outfit.price}\n` +
        `🔢 *Quantity:* 1\n\n` +
        `Thank you!`,
    );

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-4 pt-3 border-t border-border">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Main Item
        </span>

        {outfit.color && (
          <span className="text-xs uppercase tracking-widest font-medium">
            {outfit.color}
          </span>
        )}

        <StockText stock={stockNum} />
      </div>

      {/* size picker */}
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
            Please select a size before continuing
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          disabled={outOfStock}
          onClick={handleAdd}
          className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl uppercase text-xs tracking-widest transition-all duration-300 ${
            outOfStock
              ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              : isAdded
                ? "bg-black text-white"
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
<button
  onClick={handleWhatsappOrder}
  className="w-11 h-11 flex items-center justify-center rounded-xl border hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors duration-300"
>
  <FaWhatsapp size={18} />
</button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────── */
/* Single product view                     */
/* ─────────────────────────────────────── */

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

  const SIZES = ["S", "L", "XL", "XXL"];

  const stockNum = toStockNumber(outfit.stock);
  const outOfStock = stockNum !== undefined && stockNum <= 0;

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
      color: outfit.color || "",
    });

    setIsAdded(true);

    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsappOrder = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    const whatsappUrl = buildWhatsappUrl(
      `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
        `🛍️ *Item:* ${outfit.name}\n` +
        `📦 *Category:* ${outfit.category || "N/A"}\n` +
        `📐 *Size:* ${selectedSize}\n` +
        `🎨 *Color:* ${outfit.color || "N/A"}\n` +
        `💰 *Price:* ${outfit.price}\n` +
        `🔢 *Quantity:* 1\n\n` +
        `Please confirm availability and delivery details. Thank you!`,
    );

    window.open(whatsappUrl, "_blank");
  };

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

      <div className="space-y-5 lg:sticky lg:top-28">
        <p className="text-xs uppercase text-muted-foreground">
          {outfit.category} — {outfit.style || "N/A"}
        </p>

        <h1 className="text-4xl font-light">{outfit.name}</h1>

        <span className="text-2xl">{outfit.price}</span>

        <p className="text-muted-foreground">{outfit.description}</p>

        <div className="flex flex-wrap items-center gap-4">
          {outfit.color && (
            <p className="text-sm uppercase tracking-widest font-medium">
              {outfit.color}
            </p>
          )}

          <StockText stock={stockNum} />
        </div>

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
              Please select a size before continuing
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={`w-full py-4 flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-colors duration-300 ${
              outOfStock
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : isAdded
                  ? "bg-black text-white"
                  : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={16} /> Added
              </>
            ) : outOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag size={16} /> Add to Cart
              </>
            )}
          </button>

          {!outOfStock && (
<button
  onClick={handleWhatsappOrder}
  className="w-11 h-11 flex items-center justify-center rounded-xl border hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors duration-300"
>
  <FaWhatsapp size={18} />
</button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────── */
/* Variant card — DESKTOP                  */
/* ─────────────────────────────────────── */

const VariantCardDesktop = ({
  variant,
  outfit,
}: {
  variant: Variant;
  outfit: OutfitWithVariants;
}) => {
  const { addItem } = useCart();

  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    variant.size || null,
  );
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];

  const variantId = variant._id || variant.id || "";

  const variantStockNum = toStockNumber(variant.stock);

  const outOfStock =
    variantStockNum !== undefined && variantStockNum <= 0;

  const variantPrice = formatPriceFromNgn(variant.price);

  const variantImage = variant.image || outfit.image;

  const handleAdd = () => {
    if (outOfStock) return;

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    addItem({
      id: variantId,
      name: `${outfit.name}${
        variant.color ? " — " + variant.color : ""
      }`,
      price: variantPrice,
      image: variantImage,
      category: outfit.category,
      style: outfit.style || "",
      size: selectedSize,
      color: variant.color || "",
    });

    setIsAdded(true);

    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWhatsappOrder = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    const whatsappUrl = buildWhatsappUrl(
      `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
        `🛍️ *Item:* ${outfit.name}\n` +
        `🎨 *Color:* ${variant.color || "N/A"}\n` +
        `📐 *Size:* ${selectedSize}\n` +
        `💰 *Price:* ${variantPrice}\n` +
        `🔢 *Quantity:* 1\n\n` +
        `Please confirm availability and delivery details. Thank you!`,
    );

    window.open(whatsappUrl, "_blank");
  };

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
          <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {variant.color && (
          <h3 className="text-sm uppercase tracking-widest font-medium">
            {variant.color}
          </h3>
        )}

        <p className="text-sm font-medium">{variantPrice}</p>

        <StockText stock={variantStockNum} />

        {/* size picker */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
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
                className={`w-10 h-10 border text-[10px] uppercase tracking-widest transition-all duration-200 ${
                  selectedSize === size
                    ? "bg-black text-white border-black"
                    : "bg-transparent border-border hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {sizeError && (
            <p className="text-[10px] text-red-500">
              Select a size first
            </p>
          )}
        </div>

        <button
          disabled={outOfStock}
          onClick={handleAdd}
          className={`w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl uppercase text-xs tracking-widest transition-all duration-300 ${
            outOfStock
              ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              : isAdded
                ? "bg-black text-white"
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
<button
  onClick={handleWhatsappOrder}
  className="w-11 h-11 flex items-center justify-center rounded-xl border hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors duration-300"
>
  <FaWhatsapp size={18} />
</button>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────── */
/* Variant card — MOBILE                   */
/* ─────────────────────────────────────── */

const VariantCardMobile = ({
  variant,
  outfit,
}: {
  variant: Variant;
  outfit: OutfitWithVariants;
}) => {
  const { addItem } = useCart();

  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    variant.size || null,
  );
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];

  const variantId = variant._id || variant.id || "";

  const variantStockNum = toStockNumber(variant.stock);

  const outOfStock =
    variantStockNum !== undefined && variantStockNum <= 0;

  const variantPrice = formatPriceFromNgn(variant.price);

  const variantImage = variant.image || outfit.image;

  const handleAdd = () => {
    if (outOfStock) return;

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    addItem({
      id: variantId,
      name: `${outfit.name}${
        variant.color ? " — " + variant.color : ""
      }`,
      price: variantPrice,
      image: variantImage,
      category: outfit.category,
      style: outfit.style || "",
      size: selectedSize,
      color: variant.color || "",
    });

    setIsAdded(true);

    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWhatsappOrder = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    const whatsappUrl = buildWhatsappUrl(
      `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
        `🛍️ *Item:* ${outfit.name}\n` +
        `🎨 *Color:* ${variant.color || "N/A"}\n` +
        `📐 *Size:* ${selectedSize}\n` +
        `💰 *Price:* ${variantPrice}\n` +
        `🔢 *Quantity:* 1\n\n` +
        `Please confirm availability and delivery details. Thank you!`,
    );

    window.open(whatsappUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border rounded-2xl bg-card p-3 space-y-3"
    >
      <div className="flex gap-4">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-secondary">
          <img
            src={variantImage}
            alt={variant.color || outfit.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-1">
          {variant.color && (
            <p className="text-sm uppercase tracking-widest font-medium">
              {variant.color}
            </p>
          )}

          <p className="text-sm font-medium">{variantPrice}</p>

          <StockText stock={variantStockNum} />
        </div>
      </div>

      {/* size picker */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
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
              className={`w-10 h-10 border text-[10px] uppercase tracking-widest transition-all duration-200 ${
                selectedSize === size
                  ? "bg-black text-white border-black"
                  : "bg-transparent border-border hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {sizeError && (
          <p className="text-[10px] text-red-500">
            Select a size first
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          disabled={outOfStock}
          onClick={handleAdd}
          className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${
            outOfStock
              ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              : isAdded
                ? "bg-black text-white"
                : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
        </button>

        {!outOfStock && (
<button
  onClick={handleWhatsappOrder}
  className="w-11 h-11 flex items-center justify-center rounded-xl border hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors duration-300"
>
  <FaWhatsapp size={18} />
</button>
        )}
      </div>
    </motion.div>
  );
};

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isItemLoved, toggleItem } = useWishlist();

  const [outfit, setOutfit] = useState<OutfitWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showColorNotice, setShowColorNotice] = useState(false);

  const variants = Array.isArray(outfit?.variants)
    ? outfit.variants
    : [];

  const hasVariants = variants.length > 0;

  const isLoved = outfit
    ? isItemLoved(outfit.id)
    : false;

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
          color: data.color ?? undefined,
          size: data.size ?? undefined,
          stock: toStockNumber(data.stock),
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

    if (id) load();
  }, [id]);

  useEffect(() => {
    if (hasVariants) {
      setShowColorNotice(true);
    }
  }, [hasVariants]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading outfit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Outfit not found</p>
      </div>
    );
  }

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
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </motion.button>

        {!hasVariants && (
          <SingleProductView
            outfit={outfit}
            isLoved={isLoved}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {hasVariants && (
          <>
            {/* Desktop */}
            <div className="hidden md:grid md:grid-cols-[1fr_2fr] gap-10">
              <div className="self-start lg:sticky lg:top-28">
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
                      className={
                        isLoved
                          ? "text-red-500 fill-red-500"
                          : ""
                      }
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
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
                </div>

                <MainOutfitActions outfit={outfit} />

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

            {/* Mobile */}
            <div className="md:hidden space-y-4">
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
                    className={
                      isLoved
                        ? "text-red-500 fill-red-500"
                        : ""
                    }
                  />
                </button>
              </div>

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