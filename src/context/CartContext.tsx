import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

/**
 * Cart Item Interface
 * Represents an item in the shopping cart
 */
export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  // Additional product details for reference
  category?: string;
  style?: string;
}

/**
 * Cart State Interface
 */
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

/**
 * Cart Actions
 */
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

/**
 * Cart Context Interface
 */
interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  // API hooks (to be implemented later)
  addItemToApi: (item: CartItem) => Promise<void>;
  removeItemFromApi: (id: string) => Promise<void>;
  updateQuantityApi: (id: string, quantity: number) => Promise<void>;
  checkoutApi: (orderData: OrderData) => Promise<OrderResponse>;
  // Computed values
  itemCount: number;
  subtotal: number;
  totalItems: number;
}

/**
 * Order Data Interface (for checkout API)
 */
export interface OrderData {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    note?: string;
  };
}

/**
 * Order Response Interface (from checkout API)
 */
export interface OrderResponse {
  orderId: string;
  status: "success" | "error";
  message: string;
}

const CART_STORAGE_KEY = "matteekay_cart";

/**
 * Initial State
 */
const initialState: CartState = {
  items: [],
  isOpen: false,
};

/**
 * Reducer Function
 */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, items: updatedItems };
      }
      
      // Add new item
      return { ...state, items: [...state.items, action.payload] };
    }
    
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    
    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
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

/**
 * Create Context
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Price Parser Utility
 * Converts price string (e.g., "₦4,200") to number for calculations
 */
export function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
}

/**
 * Price Formatter Utility
 * Converts number to price string format
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Cart Provider Component
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Load cart from localStorage on mount
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
  
  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state.items]);
  
  // Computed values
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = state.items.reduce((sum, item) => {
    return sum + parsePrice(item.price) * item.quantity;
  }, 0);
  
  const totalItems = itemCount;
  
  /**
   * Add Item to Cart
   * TODO: Connect to API endpoint for adding items to cart
   */
  const addItem = (item: Omit<CartItem, "quantity">) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { ...item, quantity: 1 },
    });
  };
  
  /**
   * Remove Item from Cart
   * TODO: Connect to API endpoint for removing items from cart
   */
  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };
  
  /**
   * Update Item Quantity
   * TODO: Connect to API endpoint for updating item quantities
   */
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };
  
  /**
   * Clear Cart
   */
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };
  
  /**
   * Toggle Cart Drawer
   */
  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };
  
  /**
   * Open Cart Drawer
   */
  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };
  
  /**
   * Close Cart Drawer
   */
  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };
  
  /**
   * Add Item to API (Placeholder for future implementation)
   * Hook: Add item to cart via backend API
   */
  const addItemToApi = async (item: CartItem): Promise<void> => {
    // TODO: Implement API call
    // Example:
    // const response = await fetch('/api/cart/add', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(item),
    // });
    // if (!response.ok) throw new Error('Failed to add item to cart');
    
    console.log("API Hook: Add item to cart", item);
    return Promise.resolve();
  };
  
  /**
   * Remove Item from API (Placeholder for future implementation)
   * Hook: Remove item from cart via backend API
   */
  const removeItemFromApi = async (id: string): Promise<void> => {
    // TODO: Implement API call
    // Example:
    // const response = await fetch(`/api/cart/remove/${id}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) throw new Error('Failed to remove item from cart');
    
    console.log("API Hook: Remove item from cart", id);
    return Promise.resolve();
  };
  
  /**
   * Update Quantity API (Placeholder for future implementation)
   * Hook: Update item quantity via backend API
   */
  const updateQuantityApi = async (id: string, quantity: number): Promise<void> => {
    // TODO: Implement API call
    // Example:
    // const response = await fetch(`/api/cart/update/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ quantity }),
    // });
    // if (!response.ok) throw new Error('Failed to update quantity');
    
    console.log("API Hook: Update quantity", { id, quantity });
    return Promise.resolve();
  };
  
  /**
   * Checkout API (Placeholder for future implementation)
   * Hook: Process checkout via backend API
   */
  const checkoutApi = async (orderData: OrderData): Promise<OrderResponse> => {
    // TODO: Implement API call
    // Example:
    // const response = await fetch('/api/checkout', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData),
    // });
    // if (!response.ok) throw new Error('Checkout failed');
    // return response.json();
    
    console.log("API Hook: Process checkout", orderData);
    
    // Simulate API response for MVP
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

/**
 * Custom Hook for Cart Context
 * Use this hook to access cart functionality in any component
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;
