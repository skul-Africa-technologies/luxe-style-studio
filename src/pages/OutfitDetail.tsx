import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check, Heart, X, Package } from "lucide-react";

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

const StockBadge = ({ stock }: { stock?: number }) => {
  if (stock === undefined || stock === null) return null;
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${outOfStock ? "bg-red-50 text-red-600 border border-red-200" : lowStock ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
      <Package size={12} />
      {outOfStock ? "Out of Stock" : `${stock} in stock`}
    </div>
  );
};

const ColorDisplay = ({ color }: { color?: string }) => {
  if (!color) return null;
  return (
    <div className="space-y-1.5">
      <p className="uppercase text-xs tracking-widest text-muted-foreground">Color</p>
      <div className="inline-flex items-center gap-2 px-4 h-10 border border-border rounded-xl bg-secondary/40">
        <span className="text-xs uppercase tracking-widest font-medium">{color}</span>
      </div>
    </div>
  );
};

const ColorNoticeModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [show, onClose]);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="color-notice-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4" onClick={onClose}>
          <motion.div key="color-notice-panel" initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }} transition={{ duration: 0.25, ease: "easeOut" }} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 transition-colors" aria-label="Close"><X size={18} className="text-neutral-500" /></button>
            <div className="mx-auto mb-5 w-10 h-1 rounded-full bg-neutral-200 sm:hidden" />
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mx-auto text-xl">🎨</div>
              <h2 className="text-lg sm:text-xl font-semibold">Color Selection Notice</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Please note that any selected color may be delivered either as the main product displayed or from the available product variants.</p>
              <button onClick={onClose} className="w-full h-12 rounded-2xl bg-black text-white uppercase text-xs tracking-widest hover:bg-neutral-800 active:scale-[0.98] transition-all">I Understand</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────── */
/* Main item info card: color + stock + sizes only        */
/* Shown below the main image on desktop, inline on mobile*/
/* ────────────────────────────────────────────────────── */

const MainItemCardInfo = ({ outfit, horizontal = false }: { outfit: OutfitWithVariants; horizontal?: boolean }) => {
  const SIZES = ["S", "L", "XL", "XXL"];
  const stockNum = toStockNumber(outfit.stock);

  if (horizontal) {
    // Mobile: horizontal layout matching VariantCardMobile
    return (
      <div className="flex items-center gap-4 border rounded-2xl overflow-hidden bg-card p-3">
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-secondary">
          <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Main Item</p>
          {outfit.color && (
            <span className="inline-flex items-center px-2 py-0.5 border border-border rounded-lg text-xs uppercase tracking-widest bg-secondary/40">
              {outfit.color}
            </span>
          )}
          <StockBadge stock={stockNum} />
          <div className="flex flex-wrap gap-1">
            {SIZES.map((size) => (
              <span key={size} className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-xs uppercase tracking-widest">
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: vertical card below the image
  return (
    <div className="border rounded-2xl bg-card overflow-hidden p-4 space-y-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Main Item</p>
      {outfit.color && (
        <div className="space-y-1">
          <p className="uppercase text-xs tracking-widest text-muted-foreground">Color</p>
          <div className="inline-flex items-center px-3 h-8 border border-border rounded-xl bg-secondary/40">
            <span className="text-xs uppercase tracking-widest font-medium">{outfit.color}</span>
          </div>
        </div>
      )}
      <StockBadge stock={stockNum} />
      <div className="space-y-1.5">
        <p className="uppercase text-xs tracking-widest text-muted-foreground">Available Sizes</p>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <span key={size} className="w-10 h-10 flex items-center justify-center border border-border rounded-lg text-xs uppercase tracking-widest">
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────────────────── */
/* Main outfit add to cart actions           */
/* ───────────────────────────────────────── */

const MainOutfitActions = ({ outfit }: { outfit: OutfitWithVariants }) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];
  const stockNum = toStockNumber(outfit.stock);
  const outOfStock = stockNum !== undefined && stockNum <= 0;

  const handleAdd = () => {
    if (!selectedSize) { setSizeError(true); return; }
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

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n🛍️ *Item:* ${outfit.name}\n📦 *Category:* ${outfit.category || "N/A"}\n📐 *Size:* ${selectedSize || "Not selected"}\n🎨 *Color:* ${outfit.color || "N/A"}\n💰 *Price:* ${outfit.price}\n🔢 *Quantity:* 1\n\nThank you!`
  );

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Main Item</p>

      <div className="flex flex-wrap items-center gap-3">
        <ColorDisplay color={outfit.color} />
        <StockBadge stock={stockNum} />
      </div>

      <div className="space-y-2">
        <p className="uppercase text-xs tracking-widest text-muted-foreground">Select Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
              className={`w-10 h-10 border text-xs uppercase tracking-widest transition-all duration-200 ${selectedSize === size ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
              {size}
            </button>
          ))}
        </div>
        {sizeError && <p className="text-xs text-red-500">Please select a size</p>}
      </div>

      <button disabled={outOfStock} onClick={handleAdd}
        className={`w-full py-3 flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-colors duration-300 rounded-xl ${outOfStock ? "bg-neutral-300 text-white cursor-not-allowed" : isAdded ? "bg-green-700 text-white" : "bg-black text-white hover:bg-neutral-800"}`}>
        {isAdded ? (<><Check size={14} /> Added</>) : outOfStock ? "Out of Stock" : (<><ShoppingBag size={14} /> Add Main Item to Cart</>)}
      </button>

      {!outOfStock && (
        selectedSize ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="w-full py-3 flex items-center justify-center border rounded-xl uppercase text-xs tracking-widest hover:bg-foreground hover:text-background transition-colors duration-300">
            Order via WhatsApp
          </a>
        ) : (
          <button onClick={() => setSizeError(true)}
            className="w-full py-3 flex items-center justify-center border rounded-xl uppercase text-xs tracking-widest text-muted-foreground cursor-not-allowed opacity-50">
            Order via WhatsApp
          </button>
        )
      )}
    </div>
  );
};

/* ───────────────────────────────────────── */
/* No-variant layout (single product view)  */
/* ───────────────────────────────────────── */

const SingleProductView = ({ outfit, isLoved, onToggleWishlist }: { outfit: OutfitWithVariants; isLoved: boolean; onToggleWishlist: () => void }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];
  const stockNum = toStockNumber(outfit.stock);
  const outOfStock = stockNum !== undefined && stockNum <= 0;

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addItem({ id: outfit.id, name: outfit.name, price: outfit.price, image: outfit.image, category: outfit.category, style: outfit.style || "", size: selectedSize, color: outfit.color || "" });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n🛍️ *Item:* ${outfit.name}\n📦 *Category:* ${outfit.category || "N/A"}\n📐 *Size:* ${selectedSize || "Not selected"}\n🎨 *Color:* ${outfit.color || "N/A"}\n💰 *Price:* ${outfit.price}\n🔢 *Quantity:* 1\n\nPlease confirm availability and delivery details. Thank you!`
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="relative aspect-[3/4] bg-secondary rounded-2xl overflow-hidden">
        <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover" />
        <button onClick={onToggleWishlist} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full">
          <Heart size={18} className={isLoved ? "text-red-500 fill-red-500" : ""} />
        </button>
      </div>

      <div className="space-y-6 lg:sticky lg:top-28">
        <p className="text-xs uppercase text-muted-foreground">{outfit.category} — {outfit.style || "N/A"}</p>
        <h1 className="text-4xl font-light">{outfit.name}</h1>
        <span className="text-2xl">{outfit.price}</span>
        <p className="text-muted-foreground">{outfit.description}</p>

        <div className="flex flex-wrap items-center gap-3">
          <ColorDisplay color={outfit.color} />
          <StockBadge stock={stockNum} />
        </div>

        <div className="space-y-3">
          <p className="uppercase text-xs tracking-widest text-muted-foreground">Select Size</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                className={`w-12 h-12 border text-xs uppercase tracking-widest transition-all duration-200 ${selectedSize === size ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-border hover:border-foreground"}`}>
                {size}
              </button>
            ))}
          </div>
          {sizeError && <p className="text-xs text-red-500">Please select a size before adding to cart</p>}
        </div>

        <div className="space-y-4">
          <button disabled={outOfStock} onClick={handleAddToCart}
            className={`w-full py-4 flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-colors duration-300 ${outOfStock ? "bg-neutral-300 text-white cursor-not-allowed" : isAdded ? "bg-green-700 text-white" : "bg-black text-white hover:bg-neutral-800"}`}>
            {isAdded ? (<><Check size={16} /> Added</>) : outOfStock ? "Out of Stock" : (<><ShoppingBag size={16} /> Add to Cart</>)}
          </button>
          {!outOfStock && (
            selectedSize ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="w-full py-4 border text-center uppercase text-xs tracking-widest block hover:bg-foreground hover:text-background transition-colors duration-300">
                Order via WhatsApp
              </a>
            ) : (
              <button onClick={() => setSizeError(true)}
                className="w-full py-4 border uppercase text-xs tracking-widest text-muted-foreground cursor-not-allowed opacity-50">
                Order via WhatsApp
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────────── */
/* Variant card — DESKTOP                            */
/* ───────────────────────────────────────────────── */

const VariantCardDesktop = ({ variant, outfit }: { variant: Variant; outfit: OutfitWithVariants }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(variant.size || "");
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];
  const needsSizePicker = !variant.size;

  const variantId = variant._id || variant.id || "";
  const variantStockNum = toStockNumber(variant.stock);
  const outOfStock = variantStockNum !== undefined && variantStockNum <= 0;
  const variantPrice = formatPriceFromNgn(variant.price);
  const variantImage = variant.image || outfit.image;

  const handleAdd = () => {
    if (outOfStock) return;
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addItem({ id: variantId, name: `${outfit.name}${variant.color ? " — " + variant.color : ""}${selectedSize ? " / " + selectedSize : ""}`, price: variantPrice, image: variantImage, category: outfit.category, style: outfit.style || "", size: selectedSize });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n🛍️ *Item:* ${outfit.name}\n🎨 *Color:* ${variant.color || "N/A"}\n📐 *Size:* ${selectedSize || "Not selected"}\n💰 *Price:* ${variantPrice}\n🔢 *Quantity:* 1\n\nPlease confirm availability and delivery details. Thank you!`
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border rounded-2xl overflow-hidden bg-card">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img src={variantImage} alt={variant.color || outfit.name} className="w-full h-full object-cover" />
        {outOfStock && <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">Out of Stock</div>}
      </div>
      <div className="p-4 space-y-2">
        {variant.color && <h3 className="text-sm uppercase tracking-widest font-medium">{variant.color}</h3>}
        <p className="text-sm font-medium">{variantPrice}</p>
        <StockBadge stock={variantStockNum} />

        {/* Size — show picker if variant has no size, else show fixed badge */}
        {needsSizePicker ? (
          <div className="space-y-1.5 pt-1">
            <p className="uppercase text-xs tracking-widest text-muted-foreground">Select Size</p>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((size) => (
                <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  className={`w-9 h-9 border text-xs uppercase tracking-widest transition-all duration-200 rounded-lg ${selectedSize === size ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
                  {size}
                </button>
              ))}
            </div>
            {sizeError && <p className="text-xs text-red-500">Please select a size</p>}
          </div>
        ) : (
          <span className="inline-block text-xs border px-3 py-1 rounded-xl">{variant.size}</span>
        )}

        <button disabled={outOfStock} onClick={handleAdd}
          className={`w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl uppercase text-xs tracking-widest transition-all duration-300 ${outOfStock ? "bg-neutral-300 text-white cursor-not-allowed" : isAdded ? "bg-green-700 text-white" : "bg-black text-white hover:bg-neutral-800"}`}>
          {isAdded ? (<><Check size={14} /> Added</>) : outOfStock ? "Out of Stock" : (<><ShoppingBag size={14} /> Add to Cart</>)}
        </button>
        {!outOfStock && (
          selectedSize ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="w-full h-10 mt-1 flex items-center justify-center border rounded-xl uppercase text-xs tracking-widest hover:bg-foreground hover:text-background transition-colors duration-300">
              WhatsApp
            </a>
          ) : (
            <button onClick={() => setSizeError(true)}
              className="w-full h-10 mt-1 flex items-center justify-center border rounded-xl uppercase text-xs tracking-widest text-muted-foreground cursor-not-allowed opacity-50">
              WhatsApp
            </button>
          )
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────── */
/* Variant card — MOBILE                                   */
/* ─────────────────────────────────────────────────────── */

const VariantCardMobile = ({ variant, outfit }: { variant: Variant; outfit: OutfitWithVariants }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(variant.size || "");
  const [sizeError, setSizeError] = useState(false);

  const SIZES = ["S", "L", "XL", "XXL"];
  const needsSizePicker = !variant.size;

  const variantId = variant._id || variant.id || "";
  const variantStockNum = toStockNumber(variant.stock);
  const outOfStock = variantStockNum !== undefined && variantStockNum <= 0;
  const variantPrice = formatPriceFromNgn(variant.price);
  const variantImage = variant.image || outfit.image;

  const handleAdd = () => {
    if (outOfStock) return;
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addItem({ id: variantId, name: `${outfit.name}${variant.color ? " — " + variant.color : ""}${selectedSize ? " / " + selectedSize : ""}`, price: variantPrice, image: variantImage, category: outfit.category, style: outfit.style || "", size: selectedSize });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappUrl = buildWhatsappUrl(
    `Hello MATTEEKAY! 👋 I'd like to order the following:\n\n🛍️ *Item:* ${outfit.name}\n🎨 *Color:* ${variant.color || "N/A"}\n📐 *Size:* ${selectedSize || "Not selected"}\n💰 *Price:* ${variantPrice}\n🔢 *Quantity:* 1\n\nPlease confirm availability and delivery details. Thank you!`
  );

  const whatsappIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="border rounded-2xl overflow-hidden bg-card p-3 space-y-2">
      {/* Top row: image + info + action buttons */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-secondary">
          <img src={variantImage} alt={variant.color || outfit.name} className="w-full h-full object-cover" />
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-[9px] text-center px-1">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          {variant.color && <p className="text-sm uppercase tracking-widest font-medium truncate">{variant.color}</p>}
          {/* If variant has a fixed size, show it as a badge here */}
          {!needsSizePicker && <span className="inline-block text-xs border px-2 py-0.5 rounded-lg">{variant.size}</span>}
          <p className="text-sm font-medium">{variantPrice}</p>
          <StockBadge stock={variantStockNum} />
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button disabled={outOfStock} onClick={handleAdd}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 ${outOfStock ? "bg-neutral-300 text-white cursor-not-allowed" : isAdded ? "bg-green-700 text-white" : "bg-black text-white hover:bg-neutral-800"}`}>
            {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
          </button>
          {!outOfStock && (
            selectedSize ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-xl border hover:bg-foreground hover:text-background transition-colors duration-300" title="Order via WhatsApp">
                {whatsappIcon}
              </a>
            ) : (
              <button onClick={() => setSizeError(true)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border opacity-50 cursor-not-allowed text-muted-foreground" title="Select a size first">
                {whatsappIcon}
              </button>
            )
          )}
        </div>
      </div>

      {/* Size picker — only when variant has no size from API */}
      {needsSizePicker && (
        <div className="space-y-1.5 pt-1 border-t border-border">
          <p className="uppercase text-xs tracking-widest text-muted-foreground">Select Size</p>
          <div className="flex flex-wrap gap-1.5">
            {SIZES.map((size) => (
              <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                className={`w-9 h-9 border text-xs uppercase tracking-widest transition-all duration-200 rounded-lg ${selectedSize === size ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
                {size}
              </button>
            ))}
          </div>
          {sizeError && <p className="text-xs text-red-500">Please select a size</p>}
        </div>
      )}
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
        setOutfit({ ...data, variants: Array.isArray(data.variants) ? data.variants : [], basePrice: data.price, color: data.color ?? undefined, stock: toStockNumber(data.stock) });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch outfit");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading outfit...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;
  if (!outfit) return <div className="min-h-screen flex items-center justify-center"><p>Outfit not found</p></div>;

  const handleToggleWishlist = () => {
    toggleItem({ id: outfit.id, name: outfit.name, price: outfit.price, image: outfit.image, category: outfit.category });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <MobileBottomNav />

      <main className="pt-24 max-w-7xl mx-auto px-4 md:px-12 pb-24">
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate("/#collection")}
          className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back to Collection
        </motion.button>

        {/* NO VARIANTS */}
        {!hasVariants && (
          <SingleProductView outfit={outfit} isLoved={isLoved} onToggleWishlist={handleToggleWishlist} />
        )}

        {/* HAS VARIANTS */}
        {hasVariants && (
          <>
            {/* DESKTOP */}
            <div className="hidden md:grid md:grid-cols-[1fr_2fr] gap-10">
              {/* Left col: main image + info card below */}
              <div className="self-start lg:sticky lg:top-28 space-y-4">
                <div className="relative aspect-[3/4] bg-secondary rounded-2xl overflow-hidden">
                  <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover" />
                  <button onClick={handleToggleWishlist} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full">
                    <Heart size={18} className={isLoved ? "text-red-500 fill-red-500" : ""} />
                  </button>
                </div>

                {/* ← main item info card sits here, below the image */}
                <MainItemCardInfo outfit={outfit} />
              </div>

              {/* Right col: title, description, add-to-cart, variants grid */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-muted-foreground tracking-widest">{outfit.category} — {outfit.style || "N/A"}</p>
                  <h1 className="text-3xl md:text-4xl font-light">{outfit.name}</h1>
                  <p className="text-muted-foreground text-sm max-w-xl">{outfit.description}</p>
                  <p className="text-xs text-muted-foreground">{variants.length} variant{variants.length !== 1 ? "s" : ""} available</p>
                  <MainOutfitActions outfit={outfit} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {variants.map((variant) => (
                    <VariantCardDesktop key={variant._id || variant.id} variant={variant} outfit={outfit} />
                  ))}
                </div>
              </div>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-3">
              <div className="relative aspect-[4/3] bg-secondary rounded-2xl overflow-hidden">
                <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover" />
                <button onClick={handleToggleWishlist} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full">
                  <Heart size={18} className={isLoved ? "text-red-500 fill-red-500" : ""} />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground tracking-widest">{outfit.category} — {outfit.style || "N/A"}</p>
                <h1 className="text-2xl font-light">{outfit.name}</h1>
                <p className="text-muted-foreground text-sm">{outfit.description}</p>
                <p className="text-xs text-muted-foreground">{variants.length} variant{variants.length !== 1 ? "s" : ""} available</p>
              </div>

              <MainOutfitActions outfit={outfit} />

              {/* ← main item info card: horizontal, matches variant mobile style */}
              <MainItemCardInfo outfit={outfit} horizontal />

              <div className="flex flex-col gap-3">
                {variants.map((variant) => (
                  <VariantCardMobile key={variant._id || variant.id} variant={variant} outfit={outfit} />
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