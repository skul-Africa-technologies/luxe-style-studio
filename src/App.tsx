import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import OutfitDetail from "./pages/OutfitDetail";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AddItem from "./pages/admin/AddItem";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import Items from "./pages/admin/Items";
import AddSlideshow from "./pages/admin/AddSlideshow";
import { Analytics } from "@vercel/analytics/react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SessionProvider } from "@/context/SessionContext";

import { AdminThemeProvider } from "./context/AdminThemeContext";
import EditItem from "./pages/editItem";
import SlideshowManagement from "./pages/admin/Slideshow";
import AdminVariantManager from "./pages/admin/AdminVariantManager";
import OrderDetails from "./pages/admin/OrderDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SessionProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <Analytics />
            <BrowserRouter>
              <Routes>
                {/* ================= USER ROUTES ================= */}
                <Route path="/" element={<Index />} />
                <Route path="/outfit/:id" element={<OutfitDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* ================= ADMIN ROUTES ================= */}
                <Route
                  path="/admin/login"
                  element={
                    <AdminThemeProvider>
                      <Login />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminThemeProvider>
                      <Dashboard />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/items"
                  element={
                    <AdminThemeProvider>
                      <Items />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/add-item"
                  element={
                    <AdminThemeProvider>
                      <AddItem />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/add-slideshow"
                  element={
                    <AdminThemeProvider>
                      <AddSlideshow />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/orders"
                  element={
                    <AdminThemeProvider>
                      <Orders />
                    </AdminThemeProvider>
                  }
                />
                <Route
                  path="/admin/edit-item/:id"
                  element={
                    <AdminThemeProvider>
                      <EditItem />
                    </AdminThemeProvider>
                  }
                />
                <Route
                  path="/admin/manage-variants/:id"
                  element={
                    <AdminThemeProvider>
                      <AdminVariantManager />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    <AdminThemeProvider>
                      <Users />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/settings"
                  element={
                    <AdminThemeProvider>
                      <Settings />
                    </AdminThemeProvider>
                  }
                />

                <Route
                  path="/admin/slideshow"
                  element={
                    <AdminThemeProvider>
                      <SlideshowManagement />
                    </AdminThemeProvider>
                  }
                />

                {/* ================= FALLBACK ================= */}
                <Route path="*" element={<NotFound />} />
                <Route
                  path="/admin/orders/:id"
                  element={
                    <AdminThemeProvider>
                      <OrderDetails />
                    </AdminThemeProvider>
                  }
                />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
