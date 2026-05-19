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

import {
  fetchOutfitById,
  Outfit,
} from "@/data/outfits";

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

const formatPriceFromNgn = (
  price?: number,
): string => {
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

  const { isItemLoved, toggleItem } =
    useWishlist();

  /* ── State ───────────────────────────────────────────────────────────── */

  const [outfit, setOutfit] =
    useState<OutfitWithVariants | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [isAdded, setIsAdded] =
    useState(false);

  /* ── Safe variants ───────────────────────────────────────────────────── */

  const variants = Array.isArray(
    outfit?.variants,
  )
    ? outfit.variants
    : [];

  /* ── Static display values ───────────────────────────────────────────── */

  const displayPrice =
    outfit?.price ||
    outfit?.basePrice ||
    "₦0";

  const displayImage =
    outfit?.image || "/placeholder.png";

  const isLoved = outfit
    ? isItemLoved(outfit.id)
    : false;

  /* ── Fetch ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data =
          await fetchOutfitById(id || "");

        if (!data) {
          throw new Error(
            "Item not found",
          );
        }

        setOutfit({
          ...data,
          variants: Array.isArray(
            data.variants,
          )
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

  /* ── Main Product Add To Cart ────────────────────────────────────────── */

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

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  /* ───────────────────────────────────────────────────────────────────── */

  const whatsappMessage =
    encodeURIComponent(
      `Hello MATTEEKAY I want to purchase this outfit: ${
        outfit?.name || ""
      }. Price: ${displayPrice}`,
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
        <p className="text-red-500">
          {error}
        </p>
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
        {/* BACK BUTTON */}

        <motion.button
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          onClick={() =>
            navigate("/#collection")
          }
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </motion.button>

        {/* MAIN PRODUCT */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* IMAGE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="overflow-hidden bg-secondary aspect-[3/4] relative rounded-2xl"
          >
            <img
              src={displayImage}
              alt={outfit.name}
              className="w-full h-full object-cover"
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                toggleItem({
                  id: outfit.id,
                  name: outfit.name,
                  price: outfit.price,
                  image: outfit.image,
                  category:
                    outfit.category,
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
          </motion.div>

          {/* INFO */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="space-y-6"
          >
            <p className="uppercase text-xs text-muted-foreground tracking-widest">
              {outfit.category} —{" "}
              {outfit.style || "N/A"}
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

            {/* BUTTONS */}

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 uppercase text-xs tracking-widest flex items-center justify-center gap-2 ${
                  isAdded
                    ? "bg-green-700 text-white"
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
                    Add to Cart
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 border text-center uppercase text-xs tracking-widest block hover:bg-foreground hover:text-background"
              >
                Order via WhatsApp
              </a>
            </div>
          </motion.div>
        </div>

        {/* VARIANTS SECTION */}

        {variants.length > 0 && (
          <div className="mt-20">
            <div className="mb-8">
              <h2 className="text-3xl font-light">
                Available Variants
              </h2>

              <p className="text-muted-foreground mt-2">
                Select your preferred
                variant and add directly
                to cart.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {variants.map((variant) => {
                const variantPrice =
                  variant.price != null
                    ? formatPriceFromNgn(
                        variant.price,
                      )
                    : displayPrice;

                const outOfStock =
                  (variant.stock ?? 0) <=
                  0;

                return (
                  <motion.div
                    key={
                      variant._id ||
                      variant.id
                    }
                    whileHover={{
                      y: -4,
                    }}
                    className="border rounded-2xl overflow-hidden bg-background"
                  >
                    {/* IMAGE */}

                    <div className="aspect-[3/4] bg-secondary overflow-hidden">
                      <img
                        src={
                          variant.image ||
                          outfit.image
                        }
                        alt={
                          variant.color ||
                          outfit.name
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* CONTENT */}

                    <div className="p-4 space-y-4">
                      <div>
                        <h3 className="font-medium text-sm uppercase tracking-wide">
                          {variant.color ||
                            "Variant"}
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                          {variantPrice}
                        </p>
                      </div>

                      {/* SIZE */}

                      <div className="flex flex-wrap gap-2">
                        {variant.size && (
                          <span className="px-4 py-2 border rounded-xl text-sm font-medium">
                            {
                              variant.size
                            }
                          </span>
                        )}
                      </div>

                      {/* STOCK */}

                      <div>
                        {outOfStock ? (
                          <p className="text-xs text-red-500">
                            Out of stock
                          </p>
                        ) : (
                          <p className="text-xs text-green-600">
                            {
                              variant.stock
                            }{" "}
                            in stock
                          </p>
                        )}
                      </div>

                      {/* ADD BUTTON */}

                      <button
                        disabled={
                          outOfStock
                        }
                        onClick={() => {
                          addItem({
                            id:
                              variant._id ||
                              variant.id ||
                              outfit.id,

                            name: `${outfit.name} ${
                              variant.color
                                ? `- ${variant.color}`
                                : ""
                            } ${
                              variant.size
                                ? `(${variant.size})`
                                : ""
                            }`,

                            price:
                              variantPrice,

                            image:
                              variant.image ||
                              outfit.image,

                            category:
                              outfit.category,

                            style:
                              outfit.style ||
                              "",

                            size:
                              variant.size ||
                              "",
                          });
                        }}
                        className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl text-xs uppercase tracking-widest transition-all ${
                          outOfStock
                            ? "bg-neutral-400 text-white"
                            : "bg-black text-white hover:bg-neutral-800"
                        }`}
                      >
                        <ShoppingBag
                          size={16}
                        />

                        {outOfStock
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OutfitDetail;