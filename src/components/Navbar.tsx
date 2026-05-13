import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Collection", href: "#collection" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const { itemCount, openCart } = useCart();

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          <a
            href="#home"
            className="font-brand text-2xl md:text-3xl font-bold tracking-[0.2em] text-foreground uppercase"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
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

          {/* Cart button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openCart}
            className="relative p-2 text-foreground hover:text-muted-foreground transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: itemCount > 0 ? 1 : 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-[10px] font-body flex items-center justify-center"
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