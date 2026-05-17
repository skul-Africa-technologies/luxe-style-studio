import axios from "axios";

/* ================= TYPES ================= */

export interface Outfit {
  id: string;
  name: string;
  price: string;
  image: string;
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

/* ================= ENV SAFETY ================= */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("❌ VITE_API_BASE_URL is not defined in .env file");
}

/* ================= AXIOS INSTANCE ================= */

const api = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ""),
});

/* ================= LIST ================= */

export const fetchOutfits = async (
  page = 1,
  limit = 20
): Promise<Outfit[]> => {
  const res = await api.get("/api/items", {
    params: { page, limit },
  });

  const items: ApiItem[] = res.data?.data;

  if (!Array.isArray(items)) {
    throw new Error("Invalid API response format");
  }

  return items.map((item) => ({
    id: item._id,
    name: item.name,
 price: `₦${item.price.toLocaleString("en-NG")}`,
    image: item.imageUrl,
    description: item.description,
    fabric: item.fabric,
    style: item.style,
    category: item.category,
  }));
};

/* ================= SINGLE ITEM ================= */

export const fetchOutfitById = async (
  id: string
): Promise<Outfit | null> => {
  try {
    const res = await api.get(`/api/items/${id}`);

    const item: ApiItem = res.data;

    if (!item || !item._id) return null;

  return {
      id: item._id,
      name: item.name,
     price: `₦${item.price.toLocaleString("en-NG")}`,
      image: item.imageUrl,
      description: item.description,
      fabric: item.fabric ?? "",
      style: item.style ?? "",
      category: item.category,
    };
  } catch (err) {
    console.error("fetchOutfitById error:", err);
    return null;
  }
};