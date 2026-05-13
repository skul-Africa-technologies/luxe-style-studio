import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  price: string;
  image: string;
  category?: string;
  style?: string;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: "ADD_ITEM"; payload: WishlistItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "TOGGLE_ITEM"; payload: WishlistItem }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; payload: WishlistItem[] };

interface WishlistContextType {
  state: WishlistState;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  isItemLoved: (id: string) => boolean;
  itemCount: number;
}

const WISHLIST_STORAGE_KEY = "matteekay_wishlist";

const initialState: WishlistState = {
  items: [],
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "ADD_ITEM":
      if (state.items.some(item => item.id === action.payload.id)) {
        return state;
      }
      return { ...state, items: [...state.items, action.payload] };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "TOGGLE_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingIndex > -1) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }

    case "CLEAR_WISHLIST":
      return { ...state, items: [] };

    case "LOAD_WISHLIST":
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsedItems = JSON.parse(savedWishlist);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          dispatch({ type: "LOAD_WISHLIST", payload: parsedItems });
        }
      }
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  }, [state.items]);

  const addItem = (item: WishlistItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const toggleItem = (item: WishlistItem) => {
    dispatch({ type: "TOGGLE_ITEM", payload: item });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const isItemLoved = (id: string) => {
    return state.items.some((item) => item.id === id);
  };

  const itemCount = state.items.length;

  const value: WishlistContextType = {
    state,
    addItem,
    removeItem,
    toggleItem,
    clearWishlist,
    isItemLoved,
    itemCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export default WishlistContext;