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

const API_URL = "http://localhost:3001/items";

export const fetchOutfits = async (): Promise<Outfit[]> => {
  try {
    const response = await axios.get<ApiResponse>(API_URL, {
      params: { page: 1, limit: 20 },
    });

    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error("Invalid API response format");
    }

    return response.data.data.map((item: ApiItem): Outfit => ({
      id: item._id,
      name: item.name,
      price: `$${item.price.toFixed(2)}`,
      image: item.imageUrl,
      rating: Math.floor(Math.random() * 5) + 1,
      description: item.description,
      fabric: item.fabric,
      style: item.style,
      category: item.category,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Fetch error:", error.message);
      throw new Error("Failed to fetch items. Is backend running on port 3001?");
    }
    throw error;
  }
};

export const fetchOutfitById = async (id: string): Promise<Outfit | null> => {
  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/${id}`);

    if (!response.data.success || !response.data.data) {
      return null;
    }

    const item: ApiItem = response.data.data as unknown as ApiItem;

    return {
      id: item._id,
      name: item.name,
      price: `$${item.price.toFixed(2)}`,
      image: item.imageUrl,
      rating: Math.floor(Math.random() * 5) + 1,
      description: item.description,
      fabric: item.fabric,
      style: item.style,
      category: item.category,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};
