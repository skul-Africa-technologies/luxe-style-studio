import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

import { Link } from "react-router-dom";
import CartItem from "./CartItem";
import {
  glassStyle,
  glassBubbleStyle,
  glassDivider,
  glassCardStyle,
} from "@/lib/glass";

const CartDrawer = () => {
  const { state, closeCart, subtotal, itemCount } = useCart();
  const { isOpen, items } = state;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Floating glass drawer card */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className="fixed top-3 right-3 bottom-3 left-3 md:top-5 md:right-6 md:bottom-5 md:left-auto w-full max-w-md z-50 flex flex-col rounded-[28px] md:rounded-[32px]"
            style={glassStyle}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-white" />
                <h2 className="text-xl font-medium text-white">
                  Your Cart
                </h2>

                {itemCount > 0 && (
                  <span className="text-sm text-white/70">
                    ({itemCount} items)
                  </span>
                )}
              </div>

              <button
                onClick={closeCart}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white/80 hover:text-white transition-colors"
                style={glassBubbleStyle}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag
                    size={48}
                    className="text-white/30"
                  />
                  <p className="text-white/80">Your cart is empty</p>

                  <button
                    onClick={closeCart}
                    className="text-sm text-white/80 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <CartItem
                    key={
                      item.variantId ||
                      item.id ||
                      index
                    }
                    item={item}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t px-6 py-6 space-y-6" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
                <div className="flex justify-between text-white">
                  <span className="text-white/70">Subtotal</span>
                  <span>
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background rounded-[20px] hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full text-sm text-white/70 hover:text-white transition-colors"
                >
                  Continue Shopping
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