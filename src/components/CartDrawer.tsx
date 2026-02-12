import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

import { Link } from "react-router-dom";
import CartItem from "./CartItem";

const CartDrawer = () => {
  const { state, closeCart, subtotal, itemCount } = useCart();
  const { isOpen, items } = state;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
          />
          
          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-foreground" />
                <h2 className="font-display text-xl font-medium text-foreground">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="font-body text-sm text-muted-foreground">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </motion.button>
            </div>
            
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag size={48} className="text-muted-foreground/30" />
                  <p className="font-body text-muted-foreground">
                    Your cart is empty
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeCart}
                    className="font-body text-sm tracking-wider text-foreground hover:text-muted-foreground transition-colors"
                  >
                    ← Continue Shopping
                  </motion.button>
                </div>
              ) : (
                items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))
              )}
            </div>
            
            {/* Footer with totals and checkout */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-6 space-y-6 bg-secondary/20">
                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm tracking-wider text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-display text-lg text-foreground">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs tracking-wider text-muted-foreground uppercase">
                      Total Items
                    </span>
                    <span className="font-body text-sm text-foreground">
                      {itemCount}
                    </span>
                  </div>
                </div>
                
                {/* Checkout button */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background font-body text-xs tracking-[0.25em] uppercase hover:opacity-90 transition-opacity"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
                
                {/* Continue shopping */}
                <button
                  onClick={closeCart}
                  className="w-full font-body text-sm text-center text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                >
                  ← Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
