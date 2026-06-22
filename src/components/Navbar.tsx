import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const { itemCount, openCart } = useCart();

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-3 md:top-5 left-3 right-3 md:left-6 md:right-6 z-50 mb-6 md:mb-10"
      >
        <div
          className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-16 md:h-20 rounded-[28px] md:rounded-[32px]"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.03)",
          }}
        >
          {/* Brand */}
          <a
            href="#home"
            className="flex items-center gap-3 font-brand text-2xl md:text-4xl font-bold tracking-[0.2em] text-foreground uppercase"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            <img
              src="/logo.PNG"
              alt="MATTEEKAY logo"
              className="w-10 h-10 md:w-16 md:h-16 rounded-full object-cover"
              style={{
                border: "1px solid rgba(255,255,255,0.4)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
            MATTEEKAY
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Cart button — glassy bubble (hidden on mobile, already in MobileBottomNav) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={openCart}
            className="hidden md:flex relative w-11 h-11 md:w-12 md:h-12 rounded-full items-center justify-center text-foreground transition-colors"
            aria-label="Open cart"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(14px) saturate(180%)",
              WebkitBackdropFilter: "blur(14px) saturate(180%)",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.5)",
            }}
          >
            <ShoppingBag size={19} />

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: itemCount > 0 ? 1 : 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-body flex items-center justify-center"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </motion.span>
          </motion.button>
        </div>
      </motion.nav>

      <CartDrawer />
    </>
  );
};

export default Navbar;