import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType, useCart, parsePrice } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  
  const itemTotal = parsePrice(item.price) * item.quantity;
  
  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };
  
  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 p-4 bg-secondary/10 border border-border/50"
    >
      {/* Thumbnail image */}
      <div className="relative w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Item details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-display text-base font-medium text-foreground tracking-wide">
            {item.name}
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            {item.category} — {item.style}
          </p>
          <p className="font-body text-sm font-medium text-foreground">
            ${itemTotal.toLocaleString()}
          </p>
        </div>
        
        {/* Quantity controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </motion.button>
            
            <span className="font-body text-sm w-8 text-center text-foreground">
              {item.quantity}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleIncrement}
              className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
