import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check, Heart, X } from "lucide-react";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import { fetchOutfitById, Outfit } from "@/data/outfits";

/* ───────────────────────────────────────── */
/* Constants                                 */
/* ───────────────────────────────────────── */

const WHATSAPP_NUMBER = "2349036219219";

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

const buildWhatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* ───────────────────────────────────────── */
/* Color Notice Modal — standalone component */
/* ───────────────────────────────────────── */

const ColorNoticeModal = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  // Close on backdrop click or Escape key
  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [show, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="color-notice-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4"
          onClick={onClose}
        >
          <motion.div
            key="color-notice-panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            /* Stop backdrop-click from closing when clicking inside */
            onClick={(e) => e.stopPropagation()}
            className="
              w-full sm:max-w-md
              rounded-t-3xl sm:rounded-3xl
              bg-white
              p-6 sm:p-8
              shadow-2xl
              relative
            "
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-neutral-500" />
            </button>

            {/* Drag handle — visible on mobile only */}
            <div className="mx-auto mb-5 w-10 h-1 rounded-full bg-neutral-200 sm:hidden" />

            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mx-auto text-xl">
                🎨
              </div>

              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Color Selection Notice
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Please note that any selected color may be delivered either as
                the main product displayed or from the available product
                variants.
              </p>

              <button
                onClick={onClose}
                className="w-full h-12 rounded-2xl bg-black text-white uppercase text-xs tracking-widest hover:bg-neutral-800 active:scale-[0.98] transition-all"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ───────────────────────────────────────── */
/* Main outfit add to cart (with variants)  */
/* ───────────────────────────────────────── */

const MainOutfitActions = ({ outfit }: { outfit: OutfitWithVariants }) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showColorNotice, setShowColorNotice] = useState(false);

  const [isAdded, setIsAdded] = useState(false);

  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];

  const COLORS = ["Black", "White", "Red", "Blue", "Green"];
  const handleAdd = () => {
    if (!selectedSize) {
      setSizeError(true);
    }

    if (!selectedColor) {
      setColorError(true);
    }

    if (!selectedSize || !selectedColor) {
      return;
    }

    setSizeError(false);
    setColorError(false);

    addItem({
      id: outfit.id,
      name: outfit.name,
      price: outfit.price,
      image: outfit.image,
      category: outfit.category,
      style: outfit.style || "",
      size: selectedSize,
      color: selectedColor,
    });

    setIsAdded(true);

    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
      `🛍️ *Item:* ${outfit.name}\n` +
      `📦 *Category:* ${outfit.category || "N/A"}\n` +
      `📐 *Size:* ${selectedSize || "Not selected"}\n` +
      `🎨 *Color:* ${selectedColor || "Not selected"}\n` +
      `💰 *Price:* ${outfit.price}\n` +
      `🔢 *Quantity:* 1\n\n` +
      `Thank you!`,
  );

  return (
    <>
      <ColorNoticeModal
        show={showColorNotice}
        onClose={() => setShowColorNotice(false)}
      />

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

        <div className="space-y-3">
          <p className="uppercase text-xs tracking-widest text-muted-foreground">
            Select Color
          </p>

          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setColorError(false);
                  setShowColorNotice(true);
                }}
                className={`px-4 h-12 border text-xs uppercase tracking-widest transition-all duration-200 ${
                  selectedColor === color
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-foreground border-border hover:border-foreground"
                }`}
              >
                {color}
              </button>
            ))}
          </div>

          {colorError && (
            <p className="text-xs text-red-500">
              Please select a color before adding to cart
            </p>
          )}
        </div>

        {sizeError && (
          <p className="text-xs text-red-500">Please select a size</p>
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

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 flex items-center justify-center border rounded-xl uppercase text-xs tracking-widest hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          Order via WhatsApp
        </a>
      </div>
    </>
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];

  const COLORS = ["Black", "White", "Red", "Blue", "Green"];

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
    }

    if (!selectedColor) {
      setColorError(true);
    }

    if (!selectedSize || !selectedColor) {
      return;
    }

    setSizeError(false);
    setColorError(false);

    addItem({
      id: outfit.id,
      name: outfit.name,
      price: outfit.price,
      image: outfit.image,
      category: outfit.category,
      style: outfit.style || "",
      size: selectedSize,
      color: selectedColor,
    });

    setIsAdded(true);

    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
      `🛍️ *Item:* ${outfit.name}\n` +
      `📦 *Category:* ${outfit.category || "N/A"}\n` +
      `📐 *Size:* ${selectedSize || "Not selected"}\n` +
      `🎨 *Color:* ${selectedColor || "Not selected"}\n` +
      `💰 *Price:* ${outfit.price}\n` +
      `🔢 *Quantity:* 1\n\n` +
      `Please confirm availability and delivery details. Thank you!`,
  );

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

        {/* SIZE */}
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

        {/* COLOR */}
        <div className="space-y-3">
          <p className="uppercase text-xs tracking-widest text-muted-foreground">
            Select Color
          </p>

          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setColorError(false);
                }}
                className={`px-4 h-12 border text-xs uppercase tracking-widest transition-all duration-200 ${
                  selectedColor === color
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-foreground border-border hover:border-foreground"
                }`}
              >
                {color}
              </button>
            ))}
          </div>

          {colorError && (
            <p className="text-xs text-red-500">
              Please select a color before adding to cart
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
      name: `${outfit.name}${variant.color ? " — " + variant.color : ""}${variant.size ? " / " + variant.size : ""}`,
      price: variantPrice,
      image: variantImage,
      category: outfit.category,
      style: outfit.style || "",
      size: variant.size || "",
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
      `🛍️ *Item:* ${outfit.name}\n` +
      `🎨 *Color:* ${variant.color || "N/A"}\n` +
      `📐 *Size:* ${variant.size || "N/A"}\n` +
      `🎨 *Color:* ${variant.color || "N/A"}\n` +
      `💰 *Price:* ${variantPrice}\n` +
      `🔢 *Quantity:* 1\n\n` +
      `Please confirm availability and delivery details. Thank you!`,
  );

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
          <p className="text-xs text-green-600">{variant.stock} in stock</p>
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
      name: `${outfit.name}${variant.color ? " — " + variant.color : ""}${variant.size ? " / " + variant.size : ""}`,
      price: variantPrice,
      image: variantImage,
      category: outfit.category,
      style: outfit.style || "",
      size: variant.size || "",
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n` +
      `🛍️ *Item:* ${outfit.name}\n` +
      `🎨 *Color:* ${variant.color || "N/A"}\n` +
      `📐 *Size:* ${variant.size || "N/A"}\n` +
      `💰 *Price:* ${variantPrice}\n` +
      `🔢 *Quantity:* 1\n\n` +
      `Please confirm availability and delivery details. Thank you!`,
  );

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
          <p className="text-xs text-green-600">{variant.stock} in stock</p>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        {/* Cart icon button */}
        <button
          disabled={outOfStock}
          onClick={handleAdd}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 ${
            outOfStock
              ? "bg-neutral-300 text-white cursor-not-allowed"
              : isAdded
                ? "bg-green-700 text-white"
                : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
        </button>

        {/* WhatsApp icon button */}
        {!outOfStock && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 flex items-center justify-center rounded-xl border hover:bg-foreground hover:text-background transition-colors duration-300"
            title="Order via WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        )}
      </div>
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

  const variants = Array.isArray(outfit?.variants) ? outfit.variants : [];
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
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </motion.button>

        {/* NO VARIANTS */}
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
            {/* DESKTOP */}
            <div className="hidden md:grid md:grid-cols-[1fr_2fr] gap-10">
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
                    {variants.length} variant{variants.length !== 1 ? "s" : ""}{" "}
                    available
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

            {/* MOBILE */}
            <div className="md:hidden space-y-3">
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

              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground tracking-widest">
                  {outfit.category} — {outfit.style || "N/A"}
                </p>
                <h1 className="text-2xl font-light">{outfit.name}</h1>
                <p className="text-muted-foreground text-sm">
                  {outfit.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {variants.length} variant{variants.length !== 1 ? "s" : ""}{" "}
                  available
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