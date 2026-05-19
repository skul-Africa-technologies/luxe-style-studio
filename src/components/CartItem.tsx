import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  CartItem as CartItemType,
  useCart,
  parsePrice,
} from "@/context/CartContext";

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
      className="flex gap-4 p-4 bg-secondary/10 border border-border/50"
    >
      {/* image */}
      <div className="w-20 h-24 overflow-hidden">
        <img
          src={item.image}
          className="w-full h-full object-cover"
        />
      </div>

      {/* details */}
      <div className="flex-1">
        <h3>{item.name}</h3>

        <p>
          {item.category} — {item.style}
        </p>

        <p>
          ₦
          {itemTotal.toLocaleString()}
        </p>

        {/* controls */}
        <div className="flex justify-between mt-3">
          <div className="flex gap-2 items-center">
            <button onClick={handleDecrement}>
              -
            </button>

            <span>
              {item.quantity}
            </span>

            <button onClick={handleIncrement}>
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};


export default CartItem;