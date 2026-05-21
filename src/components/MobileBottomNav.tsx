import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Heart, User, Grid3X3 } from "lucide-react";
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
    if (path.startsWith("/#")) return location.pathname === "/" && location.hash === path.substring(1);
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
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-border safe-area-pb"
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleClick(item.path)}
              className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-2 w-5 h-5 bg-foreground text-background text-[10px] font-body flex items-center justify-center rounded-full"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </motion.span>
                )}
              </div>
              <span
                className={`font-body text-[10px] tracking-wider uppercase mt-1 transition-colors duration-200 ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 w-6 h-0.5 bg-foreground rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;