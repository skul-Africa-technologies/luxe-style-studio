import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  CartItem as CartItemType,
  useCart,
  parsePrice,
} from "@/context/CartContext";
import { glassCardStyle, glassBubbleStyle } from "@/lib/glass";

interface CartItemProps {
  item: CartItemType;
}
const CartItem = ({ item }: CartItemProps) => {
  const {
    updateQuantity,
    removeItem,
  } = useCart();

  const itemTotal =
    parsePrice(item.price) *
    item.quantity;

  const keyId =
    item.id;

  const handleIncrement = () => {
    updateQuantity(
      keyId,
      item.quantity + 1,
      item.size,
      item.color,
    );
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(
        keyId,
        item.quantity - 1,
        item.size,
        item.color,
      );
    } else {
      removeItem(
        keyId,
        item.size,
        item.color,
      );
    }
  };

  const handleRemove = () => {
    removeItem(
      keyId,
      item.size,
      item.color,
    );
  };

  return (
    <motion.div
      layout
      className="flex gap-4 p-4"
      style={glassCardStyle}
    >
      {/* image */}
      <div className="w-20 h-24 overflow-hidden rounded-lg">
        <img
          src={item.image}
          className="w-full h-full object-cover"
        />
      </div>

      {/* details */}
      <div className="flex-1 text-white">
        <h3 className="font-medium">{item.name}</h3>

        <p className="text-sm text-white/70">
          {item.category} — {item.style}
        </p>

        <p className="mt-1">
          ₦
          {itemTotal.toLocaleString()}
        </p>

        {/* controls */}
        <div className="flex justify-between mt-3 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={handleDecrement}
              className="w-7 h-7 flex items-center justify-center rounded-full text-white/90"
              style={glassBubbleStyle}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <span className="w-6 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <button
              onClick={handleIncrement}
              className="w-7 h-7 flex items-center justify-center rounded-full text-white/90"
              style={glassBubbleStyle}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
            style={glassBubbleStyle}
            aria-label="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};


export default CartItem;