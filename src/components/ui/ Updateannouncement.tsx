import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Truck,
  Heart,
  ShoppingBag,
  CreditCard,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   HOW THIS WORKS
   ───────────────────────────────────────────────────────────────
   1. Bump UPDATE_VERSION any time you ship a feature you want to
      announce (e.g. "2026-06-22-image-modal").
   2. List what's new in UPDATE_FEATURES below.
   3. Mount <UpdateAnnouncement /> once, near the root of your app
      (e.g. inside App.tsx, alongside your <Navbar /> or Router).
   4. It checks localStorage for the last version the visitor has
      seen. If it doesn't match UPDATE_VERSION, it shows the modal.
      Once shown (and closed), that version is stored and it will
      NOT show again — until you bump the version next time.
─────────────────────────────────────────────────────────────────── */

const UPDATE_VERSION = "2026-11-17-v4";
const STORAGE_KEY = "matteekay_last_seen_update";

// Logo path — matches the one used in Footer.tsx ("/logo.PNG" served from /public).
const LOGO_SRC = "/logo.PNG";

const UPDATE_FEATURES: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Glass cart",
    description: "Cart is now a floating frosted-glass card.",
    icon: ShoppingBag,
  },
  {
    title: "Redesigned Wishlist",
    description: "A softer, glassier Loved Collection.",
    icon: Heart,
  },
  {
    title: "Redesigned Checkout",
    description: "Cleaner glass sections and a photo order summary.",
    icon: CreditCard,
  },
  {
    title: "Pay bar on mobile",
    description: "Total and Pay button stay in view.",
    icon: Smartphone,
  },
  {
    title: "Share My Location",
    description: 'Now shows a clear "Location added" confirmation.',
    icon: MapPin,
  },
];

const FIXED_ISSUES = [
  "Pay button now works on desktop.",
  "Pay button has breathing room at the bottom.",
  "Removed stray symbols from the button label.",
];

const FAVOURITE_NOTE =
  "Tap the heart on any piece to save it to your Loved Collection.";

const CLOSING_NOTE =
  "Don't forget to check out our latest collections. Thank you for being part of the MATTEEKAY family.";

const UpdateAnnouncement = () => {
  const [show, setShow] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    try {
      const lastSeen = localStorage.getItem(STORAGE_KEY);
      if (lastSeen !== UPDATE_VERSION && !showPrevious) {
        setShow(true);
      }
    } catch {
      // localStorage unavailable — fail silently, don't block the app
    }
  }, [showPrevious]);

  useEffect(() => {
    document.body.style.overflow = show || showPrevious ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show, showPrevious]);

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, UPDATE_VERSION);
    } catch {
      // ignore
    }
    setShow(false);
    setShowPrevious(false);
  };

  return (
    <AnimatePresence>
      {show || showPrevious ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(0,0,0,0.25), rgba(0,0,0,0.45))",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="relative w-full rounded-[28px] md:rounded-[32px] overflow-hidden flex flex-col"
            style={{
              width: "auto",
              maxWidth: "min(96vw, 1100px)",
              maxHeight: "85dvh",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 0 60px rgba(255,255,255,0.03)",
            }}
          >
            {/* Header pinned top */}
            <div
              className="sticky top-0 z-10 flex flex-col md:flex-row items-start md:items-center justify-between px-5 pt-3 pb-2 gap-2 md:gap-3"
              style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-white/60 text-[11px] md:text-xs uppercase tracking-widest leading-none">
                    November 17, 2026
                  </p>
                  <h2 className="text-white text-base md:text-sm font-light leading-tight">
                    MATTEEKAY v4
                  </h2>
                </div>
                <p className="text-white/80 text-xs leading-snug">
                  We've been busy making your shopping feel as good as our pieces look. Here's what's new:
                </p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                }}
              >
                <X size={14} color="#ffffff" strokeWidth={2.5} />
              </button>
            </div>

            {/* Body — desktop grid row, mobile stacked scroll */}
            <div
              className="flex-1 min-h-0 overflow-y-auto md:overflow-visible p-4 md:p-6 space-y-5 md:space-y-4"
              style={{ overscrollBehavior: "contain" }}
            >
              {/* Desktop: single 3-column grid row */}
              <div
                className="hidden md:grid grid-cols-[1.5fr_1fr_1fr] gap-6 items-start"
              >
                {/* Column 1: New */}
                <div className="flex flex-col gap-2">
                  <p className="text-white/60 text-xs uppercase tracking-widest leading-none mb-2">
                    New
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {UPDATE_FEATURES.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.title} className="flex gap-2">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "rgba(255,255,255,0.10)",
                              border: "1px solid rgba(255,255,255,0.25)",
                            }}
                          >
                            <Icon size={13} color="#ffffff" strokeWidth={2} />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-white text-xs font-medium uppercase tracking-wide leading-none truncate">
                              {feature.title}
                            </p>
                            <p className="text-white/70 text-[11px] leading-snug">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column divider */}
                <div className="hidden md:block w-px bg-white/15 self-stretch" />

                {/* Column 2: Fixed */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-white/60 text-xs uppercase tracking-widest leading-none mb-2">
                    Fixed
                  </p>
                  {FIXED_ISSUES.map((issue, i) => (
                    <p key={i} className="text-white/70 text-xs leading-snug">
                      • {issue}
                    </p>
                  ))}
                </div>

                {/* Column divider */}
                <div className="hidden md:block w-px bg-white/15 self-stretch" />

                {/* Column 3: Our Favourites */}
                <div className="flex flex-col gap-2">
                  <p className="text-white/60 text-xs uppercase tracking-widest leading-none mb-2">
                    Our Favourites
                  </p>
                  <p className="text-white/70 text-xs leading-snug">
                    Browse our featured pieces.
                  </p>
                  <p className="text-white/70 text-xs leading-snug">
                    {FAVOURITE_NOTE}
                  </p>
                </div>
              </div>

              {/* Mobile: stacked columns */}
              <div className="md:hidden space-y-5">
                {/* New */}
                <div className="flex flex-col gap-3">
                  <p className="text-white/60 text-[11px] uppercase tracking-widest leading-none mb-2">
                    New
                  </p>
                  {UPDATE_FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="flex items-start gap-3"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(255,255,255,0.10)",
                            border: "1px solid rgba(255,255,255,0.25)",
                          }}
                        >
                          <Icon size={15} color="#ffffff" strokeWidth={2} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-white text-sm font-medium leading-none">
                            {feature.title}
                          </p>
                          <p className="text-white/70 text-xs leading-snug">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fixed */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-white/60 text-[11px] uppercase tracking-widest leading-none mb-2">
                    Fixed
                  </p>
                  {FIXED_ISSUES.map((issue, i) => (
                    <p key={i} className="text-white/70 text-xs leading-snug">
                      • {issue}
                    </p>
                  ))}
                </div>

                {/* Our Favourites */}
                <div className="flex flex-col gap-3">
                  <p className="text-white/60 text-[11px] uppercase tracking-widest leading-none mb-2">
                    Our Favourites
                  </p>
                  <p className="text-white/70 text-xs leading-snug">
                    Browse our featured pieces.
                  </p>
                  <p className="text-white/70 text-xs leading-snug">
                    {FAVOURITE_NOTE}
                  </p>
                </div>
              </div>

              {/* Closing note */}
              <div className="space-y-0.5">
                <p className="text-white/80 text-xs leading-snug">
                  {CLOSING_NOTE}
                </p>
              </div>
            </div>

            {/* Footer pinned bottom */}
            <div
              className="sticky bottom-0 z-10 flex flex-col items-start px-4 pt-3 pb-6"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <button
                onClick={handleClose}
                className="w-full h-11 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer text-white hover:bg-white/20"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  backdropFilter: "blur(14px) saturate(180%)",
                  WebkitBackdropFilter: "blur(14px) saturate(180%)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25)",
                }}
              >
                Explore Collection
              </button>
              <button
                onClick={() => setShowPrevious(true)}
                className="mt-3 text-white/50 text-[11px] hover:text-white transition-colors whitespace-nowrap"
              >
                Previous updates
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : showPrevious ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(0,0,0,0.25), rgba(0,0,0,0.45))",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="relative w-full rounded-[28px] md:rounded-[32px] overflow-hidden flex flex-col"
            style={{
              width: "auto",
              maxWidth: "min(96vw, 1100px)",
              maxHeight: "85dvh",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 0 60px rgba(255,255,255,0.03)",
            }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-6 pt-4 pb-2"
            >
              <h2 className="text-white text-xs md:text-sm font-light leading-tight">
                Previous updates
              </h2>
              <button
                onClick={() => setShowPrevious(false)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <X size={14} color="#ffffff" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              <p className="text-white/70 text-xs leading-relaxed">
                Explore earlier MATTEEKAY releases below. Tap any entry to
                expand its details.
              </p>
            </div>
            <div className="px-4 md:px-6 pt-3 pb-6">
              <button
                onClick={() => setShowPrevious(false)}
                className="w-full h-10 rounded-xl uppercase text-[10px] md:text-xs tracking-widest font-medium transition-all duration-300 cursor-pointer text-white hover:bg-white/20"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                Back
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default UpdateAnnouncement;
