const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generic API fetch wrapper
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include", // keep if you're using cookies
      ...options,
    });

    // Handle non-OK responses
    if (!res.ok) {
      let errorMessage = "Something went wrong";

      try {
        const errData = await res.json();
        errorMessage = errData.message || errorMessage;
      } catch {
        // ignore JSON parse error
      }

      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error: any) {
    console.error("API ERROR:", error.message);
    throw error;
  }
};
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});




if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not set");
}



// 🔐 Auto attach token to every request + handle FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // For FormData, remove default JSON content-type so browser can set
  // multipart/form-data with proper boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// ❌ Global error handler (optional pro feature)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);