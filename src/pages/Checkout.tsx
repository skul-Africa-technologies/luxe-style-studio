import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/context/CartContext";

interface FormData {
  name: string;
  email: string;
  phone: string;
  note: string;
  shippingAddress: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  shippingAddress?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { state, subtotal, itemCount, clearCart } = useCart();
  const { items } = state;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    note: "",
    shippingAddress: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // EMPTY CART STATE
  if (items.length === 0 && !isOrderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30" />
          <h2 className="font-display text-2xl">Your cart is empty</h2>
          <button
            onClick={() => navigate("/#collection")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Collection
          </button>
        </motion.div>
      </div>
    );
  }

  // VALIDATION
  const validateForm = () => {
    const newErrors: FormErrors = {};
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = "Email or phone required";
      newErrors.phone = "Email or phone required";
      valid = false;
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Address is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // INPUT CHANGE
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // SUBMIT ORDER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const orderPayload = {
        userId: "guest",
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        deliveryAddress: formData.shippingAddress,
        notes: formData.note,
        currency: "NGN",
        items: items.map((item) => ({
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          size: item.size ?? null,
          price:
            typeof item.price === "string"
              ? parseFloat(item.price.replace(/[^0-9.-]+/g, ""))
              : Number(item.price),
        })),
        total: subtotal,
      };

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/orders`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Order failed");
      }

      setOrderId(data._id || data.orderId || "ORDER");
      setIsOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS PAGE
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-32 text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto bg-green-500 text-white rounded-full flex items-center justify-center"
          >
            <CheckCircle size={40} />
          </motion.div>

          <h1 className="text-3xl font-bold text-green-600">
            Order Placed Successfully!
          </h1>

          <p className="text-muted-foreground">
            Thank you, {formData.name}
          </p>

          <div className="p-4 border bg-green-50 text-green-700 inline-block">
            Order ID: {orderId}
          </div>

<div className="flex justify-center gap-3 pt-4">
             <button
               onClick={() => navigate("/#collection")}
               className="px-6 py-3 bg-black text-white"
             >
               Continue Shopping
             </button>
           </div>
        </motion.div>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <MobileBottomNav />

      <main className="pt-24 max-w-6xl mx-auto px-6 md:px-12 pb-24">
        {/* BACK BUTTON */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm text-muted-foreground"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleInputChange}
              className="w-full p-3 border"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <input
              name="email"
              placeholder="Email"
              onChange={handleInputChange}
              className="w-full p-3 border"
            />

            <input
              name="phone"
              placeholder="Phone"
              onChange={handleInputChange}
              className="w-full p-3 border"
            />

            <textarea
              name="shippingAddress"
              placeholder="Shipping Address"
              onChange={handleInputChange}
              className="w-full p-3 border"
            />

            <textarea
              name="note"
              placeholder="Order Note (optional)"
              onChange={handleInputChange}
              className="w-full p-3 border"
            />

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-600 border border-red-300 text-sm">
                {errorMessage}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </form>

          {/* ORDER SUMMARY */}
          <div className="border p-6 h-fit">
            <h2 className="text-lg mb-4">Order Summary</h2>

            {items.map((item) => (
              <div key={item.id} className="flex justify-between mb-3">
                <span>{item.name}</span>
                <span>× {item.quantity}</span>
              </div>
            ))}

            <hr className="my-4" />

            <div className="flex justify-between">
              <span>Total Items</span>
              <span>{itemCount}</span>
            </div>

            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>₦{subtotal.toLocaleString("en-NG")}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;