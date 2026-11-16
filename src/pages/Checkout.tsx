import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  ShoppingBag,
  MapPin,
  Shield,
  Truck,
  Phone,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/context/CartContext";
import { glassStyle, glassBubbleStyle, glassCardStyle } from "@/lib/glass";

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

interface CustomerLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

type LocationStatus = "idle" | "loading" | "success" | "error";

const inputStyle = {
  background: "rgba(255,255,255,0.35)",
  border: "1px solid rgba(255,255,255,0.5)",
  WebkitBackdropFilter: "blur(12px) saturate(180%)",
  backdropFilter: "blur(12px) saturate(180%)",
  boxShadow:
    "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.03)",
};

const Checkout = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const { state, subtotal, itemCount } = useCart();

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

  const [summaryExpanded, setSummaryExpanded] = useState(true);

  /* ---------------- LOCATION SHARING ---------------- */
  const [location, setLocation] = useState<CustomerLocation | null>(null);

  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");

  const [locationError, setLocationError] = useState("");

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation isn't supported by your browser");
      return;
    }

    setLocationStatus("loading");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationStatus("success");
      },
      (error) => {
        setLocationStatus("error");
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. You can still check out without it."
            : "Couldn't get your location. Please try again."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /* ---------------- EMPTY CART ---------------- */
  if (items.length === 0 && !isOrderPlaced) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[#faf7f3]">
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gold/12 blur-3xl" />
          <div className="absolute bottom-[-15%] right-[-12%] w-[540px] h-[540px] rounded-full bg-[#0a0a0a]/8 blur-3xl" />
        </div>
        <Navbar />
        <MobileBottomNav />
        <div className="min-h-screen flex items-center justify-center px-6 pt-28 md:pt-36 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <ShoppingBag
              size={48}
              className="mx-auto text-muted-foreground/30"
            />

            <h2 className="font-display text-2xl">Your cart is empty</h2>

            <button
              onClick={() => navigate("/#collection")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Collection
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ---------------- VALIDATION ---------------- */
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

  const fieldValid = (name: keyof FormErrors) => {
    const value = formData[name as keyof FormData];
    if (name === "email" || name === "phone") {
      return (
        (formData.email.trim() || formData.phone.trim()) &&
        !errors.email &&
        !errors.phone
      );
    }
    return String(value).trim() !== "" && !errors[name];
  };

  /* ---------------- INPUT CHANGE ---------------- */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /* ---------------- SUBMIT ORDER + PAYSTACK ---------------- */
  // The event is optional so the Pay buttons (which sit outside the <form>)
  // can call this directly, while pressing Enter inside the form still works.
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    setErrorMessage("");

    try {
      /* ---------------- CREATE ORDER PAYLOAD ---------------- */
      const orderPayload = {
        userId: "guest",

        fullName: formData.name,

        email: formData.email,

        phone: formData.phone,

        deliveryAddress: formData.shippingAddress,

        notes: formData.note,

        currency: "NGN",

        // Customer's shared geolocation (optional — may be null
        // if they declined or the browser doesn't support it)
        location: location
          ? {
              lat: location.lat,
              lng: location.lng,
              accuracy: location.accuracy,
            }
          : null,

        items: items.map((item) => ({
          itemId: item.id,

          name: item.name,

          quantity: item.quantity,

          size: item.size ?? null,

          color: item.color ?? null,

          price:
            typeof item.price === "string"
              ? parseFloat(item.price.replace(/[^0-9.-]+/g, ""))
              : Number(item.price),
        })),

        total: subtotal,
      };

      /* ---------------- STEP 1: CREATE ORDER ---------------- */
      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(orderPayload),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData?.message || "Failed to create order");
      }

      const createdOrderId = orderData._id || orderData.orderId;

      if (!createdOrderId) {
        throw new Error("Order ID not returned");
      }

      /* ---------------- STEP 2: INITIALIZE PAYMENT ---------------- */
      const paymentResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/payments/initialize`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            orderId: createdOrderId,
          }),
        }
      );

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData?.message || "Failed to initialize payment"
        );
      }

      /* ---------------- GET PAYSTACK URL ---------------- */
      const paymentUrl = paymentData?.data?.authorization_url;

      if (!paymentUrl) {
        throw new Error("Payment link not returned");
      }

      /* ---------------- SAVE ORDER ---------------- */
      localStorage.setItem("pendingOrderId", createdOrderId);

      setOrderId(createdOrderId);

      /* ---------------- REDIRECT TO PAYSTACK ---------------- */
      window.location.href = paymentUrl;
    } catch (err: unknown) {
      console.error("Checkout error:", err);

      setErrorMessage((err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- SUCCESS PAGE ---------------- */
  if (isOrderPlaced) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[#faf7f3]">
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gold/12 blur-3xl" />
          <div className="absolute bottom-[-15%] right-[-12%] w-[540px] h-[540px] rounded-full bg-[#0a0a0a]/8 blur-3xl" />
        </div>
        <Navbar />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-32 md:pt-36 text-center space-y-6 px-6 pb-32"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto bg-green-500 text-white rounded-full flex items-center justify-center"
          >
            <CheckCircle size={40} />
          </motion.div>

          <h1 className="text-3xl font-bold text-green-600 font-display">
            Order Placed Successfully!
          </h1>

          <p className="text-muted-foreground">Thank you, {formData.name}</p>

          <div
            style={glassCardStyle}
            className="inline-block p-4 rounded-[20px]"
          >
            Order ID: {orderId}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => navigate("/#collection")}
              className="px-6 py-3 bg-black text-white rounded-full"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>

        <MobileBottomNav />
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf7f3]">
      {/* Backdrop blobs behind content */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-12%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-12%] w-[620px] h-[620px] rounded-full bg-[#0a0a0a]/7 blur-3xl" />
        <div className="absolute top-[-20%] right-[-14%] w-[520px] h-[520px] rounded-full bg-[#fdfaf8]/18 blur-3xl" />
      </div>

      <Navbar />

      <MobileBottomNav />

      {/* Bottom padding keeps the pay button off the bottom edge:
          desktop pb-24, mobile pb-72 so the sticky pay bar never covers the last field */}
      <main
        className="max-w-6xl mx-auto px-6 md:px-12 pb-72 lg:pb-24"
        style={{ paddingTop: "120px" }}
      >
        {/* HEADER */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={reduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 md:mb-14"
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-foreground shrink-0"
            aria-label="Back"
            style={glassBubbleStyle}
          >
            <ArrowLeft size={17} />
          </motion.button>

          <div className="mt-4 md:mt-6">
            <h1 className="font-display text-3xl md:text-5xl font-light text-foreground tracking-tight">
              Checkout
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground tracking-wider font-body">
              Almost yours. Tell us where to send it.
            </p>
          </div>
        </motion.div>

        {/* DESKTOP: two columns */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* FORM */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="space-y-6"
          >
            {renderForm()}
            {renderPayButton(false)}
          </motion.div>

          {/* ORDER SUMMARY */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="lg:sticky lg:top-[130px]"
          >
            {renderOrderSummary(true)}
          </motion.div>
        </div>

        {/* MOBILE: single column */}
        <div className="lg:hidden space-y-6">
          {/* Order Summary first, collapsible */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            {renderOrderSummary(false)}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="space-y-6"
          >
            {renderForm()}
          </motion.div>
        </div>
      </main>

      {/* Mobile sticky pay bar */}
      <div
        className="lg:hidden fixed bottom-28 left-4 right-4 z-40 pointer-events-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: 20 }}
            style={glassStyle}
            className="rounded-[28px] p-5 flex flex-col items-center justify-between gap-3 shadow-lg"
          >
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-body tracking-wider uppercase">
                Total
              </p>
              <p className="text-base font-display font-medium text-foreground">
                ₦{subtotal.toLocaleString("en-NG")}
              </p>
            </div>
            {renderPayButton(true)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  /* ---------------- RENDER HELPERS ---------------- */
  function renderForm() {
    return (
      <form onSubmit={handleSubmit}>
        {/* CONTACT CARD */}
        <section
          style={glassStyle}
          className="rounded-[28px] md:rounded-[32px] p-6 md:p-8"
        >
          <div className="mb-6">
            <h3 className="font-display text-lg md:text-xl font-medium text-foreground">
              Contact
            </h3>
            <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
              Full name, email and phone
            </p>
          </div>

          <div className="space-y-4">
            <CheckoutField
              label="Full Name"
              name="name"
              value={formData.name}
              placeholder="Jane Adebayo"
              autoComplete="name"
              error={errors.name}
              valid={fieldValid("name")}
              onChange={handleInputChange}
            />
            <CheckoutField
              label="Email"
              name="email"
              value={formData.email}
              placeholder="jane@example.com"
              type="email"
              autoComplete="email"
              error={errors.email}
              valid={fieldValid("email")}
              onChange={handleInputChange}
            />
            <CheckoutField
              label="Phone"
              name="phone"
              value={formData.phone}
              placeholder="08012345678"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              error={errors.phone}
              valid={fieldValid("phone")}
              onChange={handleInputChange}
            />
          </div>
        </section>

        {/* DELIVERY CARD */}
        <section
          style={glassStyle}
          className="rounded-[28px] md:rounded-[32px] p-6 md:p-8 mt-6"
        >
          <div className="mb-6">
            <h3 className="font-display text-lg md:text-xl font-medium text-foreground">
              Delivery
            </h3>
            <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
              Where we should send your order
            </p>
          </div>

          <div className="space-y-4">
            <CheckoutField
              label="Shipping Address"
              name="shippingAddress"
              value={formData.shippingAddress}
              as="textarea"
              placeholder="12, Adeola Odeku Street, Victoria Island, Lagos"
              rows={3}
              autoComplete="shipping street-address"
              error={errors.shippingAddress}
              valid={fieldValid("shippingAddress")}
              onChange={handleInputChange}
            />

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleShareLocation}
                disabled={locationStatus === "loading"}
                className="flex w-full items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-body disabled:opacity-60 transition-all"
                style={{
                  background: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  WebkitBackdropFilter: "blur(12px) saturate(180%)",
                  backdropFilter: "blur(12px) saturate(180%)",
                  boxShadow:
                    "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.03)",
                }}
                aria-label={
                  locationStatus === "success"
                    ? "Location shared"
                    : "Share my location"
                }
              >
                {locationStatus === "loading" ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : locationStatus === "success" ? (
                  <CheckCircle size={16} className="text-foreground" />
                ) : (
                  <MapPin size={16} />
                )}
                {locationStatus === "success"
                  ? "Location added"
                  : "Share My Location"}
              </button>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Sharing your location helps our riders find you faster. This is
                optional.
              </p>

              {locationStatus === "success" && location && (
                <div className="space-y-2 pt-2">
                  <div className="rounded-[16px] overflow-hidden border h-48 bg-background">
                    <iframe
                      title="Your shared location"
                      width="100%"
                      height="100%"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-green-600">
                      Location captured
                      {typeof location.accuracy === "number" &&
                        ` (accurate to ±${Math.round(location.accuracy)}m)`}
                    </p>

                    <a
                      href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Pin looks off? GPS accuracy can vary by device and signal —
                    try re-sharing from a phone outdoors, or just rely on the
                    address above.
                  </p>

                  <button
                    type="button"
                    onClick={handleShareLocation}
                    className="text-xs text-muted-foreground underline"
                  >
                    Re-share location
                  </button>
                </div>
              )}

              {locationStatus === "error" && (
                <p className="text-xs text-red-500">{locationError}</p>
              )}
            </div>

            <CheckoutField
              label="Order Note"
              name="note"
              value={formData.note}
              as="textarea"
              placeholder="Anything we should know? (optional)"
              rows={3}
              autoComplete="off"
              optional
              error={undefined}
              valid={false}
              onChange={handleInputChange}
            />
          </div>
        </section>

        {/* ERROR */}
        {errorMessage && (
          <div
            style={{
              background: "rgba(139,0,0,0.10)",
              border: "1px solid rgba(139,0,0,0.25)",
              color: "#8b0000",
            }}
            className="rounded-[16px] p-4 text-sm mt-6"
          >
            {errorMessage}
          </div>
        )}
      </form>
    );
  }

  // The Pay button lives outside the <form>, so it calls handleSubmit directly
  // (a type="submit" button outside a form does nothing).
  function renderPayButton(mobile: boolean) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => handleSubmit()}
        disabled={isSubmitting}
        className={`w-full py-2.5 md:py-3 rounded-full bg-foreground text-background font-body text-xs md:text-sm tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${
          mobile ? "mt-2" : "mt-8"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Processing…
          </>
        ) : (
          <>
            {`Pay ₦${subtotal.toLocaleString("en-NG")}`}
            <ArrowRight size={17} />
          </>
        )}
      </motion.button>
    );
  }

  function renderOrderSummary(desktop: boolean) {
    return (
      <section
        style={glassStyle}
        className={`rounded-[28px] md:rounded-[32px] p-6 md:p-8 ${
          desktop ? "lg:shrink-0" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg md:text-xl font-medium text-foreground">
            Order Summary
          </h2>
          <button
            type="button"
            onClick={() => setSummaryExpanded((p) => !p)}
            className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              summaryExpanded ? "Collapse summary" : "Expand summary"
            }
          >
            {summaryExpanded ? (
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background text-[10px]">
                −
              </span>
            ) : (
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background text-[10px]">
                +
              </span>
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {summaryExpanded && (
            <motion.div
              initial={reduced ? {} : { opacity: 0, height: 0 }}
              animate={reduced ? {} : { opacity: 1, height: "auto" }}
              exit={reduced ? {} : { opacity: 0, height: 0 }}
              className="transition-[height] overflow-hidden"
              style={{ height: summaryExpanded ? "auto" : 0 }}
            >
              <div className="space-y-3 mb-6">
                {items.map((item) => {
                  const linePrice =
                    (parseFloat(
                      typeof item.price === "string"
                        ? item.price.replace(/[^0-9.-]+/g, "")
                        : String(item.price)
                    ) || 0) * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 md:w-14 md:h-14 rounded-[12px] object-cover object-center bg-secondary"
                        />
                        <div>
                          <p className="font-body text-sm text-foreground leading-tight">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-body text-sm font-medium text-foreground">
                        ₦{linePrice.toLocaleString("en-NG")}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                className="my-4"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.3)",
                }}
              />

              <div className="flex justify-between items-end mb-1">
                <span className="font-body text-sm text-muted-foreground">
                  Total Items
                </span>
                <span className="font-body text-sm text-foreground">
                  {itemCount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-display text-lg font-medium text-foreground">
                  Total
                </span>
                <span className="font-display text-lg font-bold text-foreground">
                  ₦{subtotal.toLocaleString("en-NG")}
                </span>
              </div>

              <div className="mt-6 space-y-2">
                {[
                  { label: "Secure checkout", icon: Shield },
                  { label: "Delivery to your door", icon: Truck },
                  { label: "Easy support on WhatsApp", icon: Phone },
                ].map((trust) => {
                  const Icon = trust.icon;
                  return (
                    <div key={trust.label} className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-body">
                        {trust.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }
};

interface CheckoutFieldProps {
  label: string;
  name: keyof FormData;
  value: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  rows?: number;
  as?: "textarea";
  optional?: boolean;
  error?: string;
  valid: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

function CheckoutField({
  label,
  name,
  value,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  rows,
  as,
  optional,
  error,
  valid,
  onChange,
}: CheckoutFieldProps) {
  const isInvalid = Boolean(error);
  const showCheck = valid && !isInvalid;

  const stateStyle = {
    ...inputStyle,
    ...(isInvalid
      ? {
          borderColor: "rgba(139,0,0,0.6)",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.03), 0 0 0 3px rgba(139,0,0,0.12)",
        }
      : {}),
    ...(showCheck
      ? {
          borderColor: "rgba(0,128,0,0.5)",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.03), 0 0 0 3px rgba(0,128,0,0.12)",
        }
      : {}),
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-body text-muted-foreground tracking-wider uppercase flex justify-between">
        {label}
        {optional && <span className="text-[10px] opacity-60">optional</span>}
      </label>

      {as === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={rows}
          value={value}
          onChange={onChange}
          className="w-full p-3 text-base font-body text-foreground rounded-[16px] transition-all focus-visible:outline-none"
          style={stateStyle}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          className="w-full p-3 text-base font-body text-foreground rounded-[16px] transition-all focus-visible:outline-none"
          style={stateStyle}
        />
      )}

      {isInvalid && error && (
        <p className="text-xs text-red-500 font-body">{error}</p>
      )}

      {showCheck && (
        <div className="flex items-center gap-1">
          <CheckCircle size={12} className="text-green-600" />
          <span className="text-xs text-green-600 font-body">Valid</span>
        </div>
      )}
    </div>
  );
}

export default Checkout;