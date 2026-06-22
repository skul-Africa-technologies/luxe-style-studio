import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Heart, Grid3X3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  if (!isMobile) return null;

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Collection", icon: Grid3X3, path: "/#collection" },
    { label: "Loved", icon: Heart, path: "/wishlist", badge: wishlistCount },
    { label: "Cart", icon: ShoppingBag, path: "/checkout", badge: itemCount },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.startsWith("/#"))
      return location.pathname === "/" && location.hash === path.substring(1);
    return location.pathname === path;
  };

  const handleClick = (path: string) => {
    if (path.startsWith("/#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(path.substring(2));
          element?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const element = document.getElementById(path.substring(2));
        element?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="fixed bottom-3 left-3 right-3 z-50 safe-area-pb"
    >
      <div
        className="flex items-center justify-around h-16 rounded-[28px]"
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
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleClick(item.path)}
              className="relative flex items-center justify-center w-full h-full"
              aria-label={item.label}
            >
              <motion.div
                animate={{
                  scale: active ? 1.08 : 1,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="relative flex items-center justify-center w-10 h-10 rounded-full"
                style={
                  active
                    ? {
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        backdropFilter: "blur(14px) saturate(180%)",
                        WebkitBackdropFilter: "blur(14px) saturate(180%)",
                        boxShadow:
                          "0 2px 10px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.5)",
                      }
                    : undefined
                }
              >
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                />

                {(item.badge ?? 0) > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[10px] font-semibold flex items-center justify-center leading-none"
                    style={{
                      boxShadow:
                        "0 4px 10px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;
