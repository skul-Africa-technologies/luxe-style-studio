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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="text-xl font-medium">
                  Your Cart
                </h2>

                {itemCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({itemCount} items)
                  </span>
                )}
              </div>

              <button
                onClick={closeCart}
                className="w-10 h-10 flex items-center justify-center"
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
                    className="text-muted-foreground/30"
                  />
                  <p>Your cart is empty</p>

                  <button onClick={closeCart}>
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
              <div className="border-t px-6 py-6 space-y-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-black text-white"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full text-sm text-muted-foreground"
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