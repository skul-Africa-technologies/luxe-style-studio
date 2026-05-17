import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  size?: string; // e.g. S, M, L, XL, XXL
  category?: string;
  style?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string; size?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; size?: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItemToApi: (item: CartItem) => Promise<void>;
  removeItemFromApi: (id: string) => Promise<void>;
  updateQuantityApi: (id: string, quantity: number) => Promise<void>;
  checkoutApi: (orderData: OrderData) => Promise<OrderResponse>;
  itemCount: number;
  subtotal: number;
  totalItems: number;
}

export interface OrderData {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    note?: string;
  };
}

export interface OrderResponse {
  orderId: string;
  status: "success" | "error";
  message: string;
}

const CART_STORAGE_KEY = "matteekay_cart";

const initialState: CartState = {
  items: [],
  isOpen: false,
};

// Unique key per item+size combination
const itemKey = (id: string, size?: string) => `${id}__${size ?? "none"}`;

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const key = itemKey(action.payload.id, action.payload.size);
      const existingIndex = state.items.findIndex(
        (item) => itemKey(item.id, item.size) === key
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems };
      }

      return { ...state, items: [...state.items, action.payload] };
    }

    case "REMOVE_ITEM": {
      const key = itemKey(action.payload.id, action.payload.size);
      return {
        ...state,
        items: state.items.filter((item) => itemKey(item.id, item.size) !== key),
      };
    }

    case "UPDATE_QUANTITY": {
      const key = itemKey(action.payload.id, action.payload.size);
      const updatedItems = state.items.map((item) =>
        itemKey(item.id, item.size) === key
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return { ...state, items: updatedItems };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    case "LOAD_CART":
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedItems = JSON.parse(savedCart);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          dispatch({ type: "LOAD_CART", payload: parsedItems });
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state.items]);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = state.items.reduce((sum, item) => {
    return sum + parsePrice(item.price) * item.quantity;
  }, 0);

  const totalItems = itemCount;

  const addItem = (item: Omit<CartItem, "quantity">) => {
    dispatch({ type: "ADD_ITEM", payload: { ...item, quantity: 1 } });
  };

  const removeItem = (id: string, size?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, size } });
  };

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    if (quantity < 1) {
      removeItem(id, size);
      return;
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, size, quantity } });
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const openCart = () => dispatch({ type: "OPEN_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  const addItemToApi = async (item: CartItem): Promise<void> => {
    console.log("API Hook: Add item to cart", item);
    return Promise.resolve();
  };

  const removeItemFromApi = async (id: string): Promise<void> => {
    console.log("API Hook: Remove item from cart", id);
    return Promise.resolve();
  };

  const updateQuantityApi = async (id: string, quantity: number): Promise<void> => {
    console.log("API Hook: Update quantity", { id, quantity });
    return Promise.resolve();
  };

  const checkoutApi = async (orderData: OrderData): Promise<OrderResponse> => {
    console.log("API Hook: Process checkout", orderData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: `ORD-${Date.now()}`,
          status: "success",
          message: "Order placed successfully",
        });
      }, 1500);
    });
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    addItemToApi,
    removeItemFromApi,
    updateQuantityApi,
    checkoutApi,
    itemCount,
    subtotal,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;