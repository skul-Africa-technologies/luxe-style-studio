import axios from "axios";

export interface Outfit {
  id: string;
  name: string;
  price: string;
  image: string;
  rating: number;
  description: string;
  fabric?: string;
  style?: string;
  category: string;
}

export interface ApiItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  fabric?: string;
  style?: string;
}

export interface ApiResponse {
  data: ApiItem[];
  success: boolean;
  message?: string;
}

// Simple cache for outfits list (key: page-limit) and single outfit (key: id)
const outfitsListCache = new Map<
  string,
  { data: Outfit[]; timestamp: number }
>();
const outfitCache = new Map<string, { data: Outfit; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not set");
}

const API_URL = `${BASE_URL.replace(/\/$/, "")}/items`;

export const fetchOutfits = async (
  page: number = 1,
  limit: number = 20,
): Promise<Outfit[]> => {
  const cacheKey = `${page}-${limit}`;
  const cached = outfitsListCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get<ApiResponse>(API_URL, {
      params: { page, limit },
    });

    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error("Invalid API response format");
    }

    const outfits: Outfit[] = response.data.data.map(
      (item: ApiItem): Outfit => ({
        id: item._id,
        name: item.name,
        price: `$${item.price.toFixed(2)}`,
        image: item.imageUrl,
        rating: Math.floor(Math.random() * 5) + 1, // TODO: Replace with actual rating from backend
        description: item.description,
        fabric: item.fabric,
        style: item.style,
        category: item.category,
      }),
    );

    outfitsListCache.set(cacheKey, { data: outfits, timestamp: now });
    return outfits;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Fetch error:", error.message);
      throw new Error("Failed to fetch items from server.");
    }
    throw error;
  }
};

export const fetchOutfitById = async (id: string): Promise<Outfit | null> => {
  const cached = outfitCache.get(id);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/${id}`);

    if (!response.data.success || !response.data.data) {
      return null;
    }

    const item: ApiItem = response.data.data as unknown as ApiItem;

    const outfit: Outfit = {
      id: item._id,
      name: item.name,
      price: `$${item.price.toFixed(2)}`,
      image: item.imageUrl,
      rating: Math.floor(Math.random() * 5) + 1, // TODO: Replace with actual rating from backend
      description: item.description,
      fabric: item.fabric,
      style: item.style,
      category: item.category,
    };

    outfitCache.set(id, { data: outfit, timestamp: now });
    return outfit;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};
