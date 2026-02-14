import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AdminTheme = "admin-light" | "admin-dark";

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const ADMIN_THEME_KEY = "admin-theme";
const DEFAULT_THEME: AdminTheme = "admin-light";

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(ADMIN_THEME_KEY) as AdminTheme | null;
    if (savedTheme) {
      return savedTheme;
    }
    // Default to light theme
    return DEFAULT_THEME;
  });

  // Apply theme class to the admin wrapper element
  useEffect(() => {
    // Find the admin layout wrapper and apply the theme class
    const adminWrapper = document.querySelector(".admin-theme-wrapper");
    if (adminWrapper) {
      adminWrapper.classList.remove("admin-light", "admin-dark");
      adminWrapper.classList.add(theme);
    }
    // Save to localStorage
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "admin-light" ? "admin-dark" : "admin-light"));
  };

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
