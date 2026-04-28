import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (items.length === 0 && !isOrderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30" />
          <h2 className="font-display text-2xl text-foreground">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate("/#collection")}
            className="font-body text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Collection
          </button>
        </motion.div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = "At least one contact method is required";
      newErrors.phone = "At least one contact method is required";
      isValid = false;
    } else if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderPayload = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: formData.shippingAddress,
        notes: formData.note,
        items: items.map((item) => ({
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price.replace(/[^0-9.-]+/g, "")),
        })),
        total: subtotal,
      };

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
          method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(orderPayload),
       });

      const data = await response.json();

      if (response.ok) {
        setOrderId(data._id || data.orderId || "Order");
        setIsOrderPlaced(true);
        clearCart();
      } else {
        throw new Error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-32 pb-24 px-6"
        >
          <div className="max-w-lg mx-auto text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="w-20 h-20 mx-auto bg-foreground text-background rounded-full flex items-center justify-center"
            >
              <CheckCircle size={40} />
            </motion.div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl md:text-4xl text-foreground">
                Order Placed Successfully!
              </h1>
              <p className="font-body text-muted-foreground text-lg">
                Thank you for your order, {formData.name}
              </p>
            </div>
            <div className="p-6 bg-secondary/20 border border-border space-y-3">
              <p className="font-body text-sm text-muted-foreground">
                Order ID:{" "}
                <span className="font-medium text-foreground">{orderId}</span>
              </p>
              <p className="font-body text-sm text-muted-foreground">
                A confirmation has been sent to your contact information.
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <p className="font-body text-base text-foreground">
                MATTEEKAY will contact you shortly to confirm your order
                details and arrange delivery.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/#collection")}
                className="px-8 py-4 bg-foreground text-background font-body text-xs tracking-[0.25em] uppercase hover:opacity-90 transition-opacity"
              >
                Continue Shopping
              </motion.button>
            </div>
          </div>
        </motion.main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 pb-8">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-body text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
        </div>
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-8">
                Checkout
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-secondary/10 border border-border focus:border-foreground focus:outline-none transition-colors font-body text-sm text-foreground placeholder:text-muted-foreground/50"
                  />
                  {errors.name && (
                    <p className="font-body text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com (optional)"
                    className="w-full px-4 py-3 bg-secondary/10 border border-border focus:border-foreground focus:outline-none transition-colors font-body text-sm text-foreground placeholder:text-muted-foreground/50"
                  />
                  {errors.email && (
                    <p className="font-body text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
                {/* Phone */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000 (optional)"
                    className="w-full px-4 py-3 bg-secondary/10 border border-border focus:border-foreground focus:outline-none transition-colors font-body text-sm text-foreground placeholder:text-muted-foreground/50"
                  />
                  {errors.phone && (
                    <p className="font-body text-xs text-destructive">
                      {errors.phone}
                    </p>
                  )}
                </div>
                {/* Shipping Address */}
                <div className="space-y-2">
                  <label
                    htmlFor="shippingAddress"
                    className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground"
                  >
                    Shipping Address *
                  </label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your shipping address"
                    rows={3}
                    className="w-full px-4 py-3 bg-secondary/10 border border-border focus:border-foreground focus:outline-none transition-colors font-body text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                  />
                  {errors.shippingAddress && (
                    <p className="font-body text-xs text-destructive">
                      {errors.shippingAddress}
                    </p>
                  )}
                </div>
                {/* Note */}
                <div className="space-y-2">
                  <label
                    htmlFor="note"
                    className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground"
                  >
                    Delivery Note (Optional)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for your order..."
                    rows={4}
                    className="w-full px-4 py-3 bg-secondary/10 border border-border focus:border-foreground focus:outline-none transition-colors font-body text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>
                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background font-body text-xs tracking-[0.3em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
              </motion.button>
                <p className="font-body text-[11px] text-center text-muted-foreground tracking-wider">
                  By placing your order, you agree to receive communication from
                  MATTEEKAY 
                </p>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:sticky lg:top-28"
            >
              <div className="bg-secondary/20 border border-border p-6 md:p-8">
                <h2 className="font-display text-xl text-foreground mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 bg-secondary overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-sm text-foreground">
                          {item.name}
                        </h3>
                        <p className="font-body text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-body text-sm font-medium text-foreground mt-1">
                          $
                          {(
                            parseFloat(item.price.replace(/[^0-9.-]+/g, "")) *
                            item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm tracking-wider text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-display text-lg text-foreground">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm tracking-wider text-muted-foreground">
                      Total Items
                    </span>
                    <span className="font-body text-sm text-foreground">
                      {itemCount}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border mx-auto" />
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg text-foreground">
                      Total
                    </span>
                    <span className="font-display text-xl font-medium text-foreground">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
