import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { fetchOrderById, OrderApi } from "@/lib/api";

interface OrderItemDisplay {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("Order ID is required");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchOrderById(orderId);
        if (data) {
          setOrder(data);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const copyOrderId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString("en-NG")}`;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      paid: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      delivered: "bg-green-500/10 text-green-600 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return colors[status] || "bg-secondary/10 text-foreground border-border";
  };

  const whatsappMessage = order
    ? encodeURIComponent(
        `Hello MATTEEKAY, I have a question about my order ${order._id}`,
      )
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <MobileBottomNav />

      <main className="pt-24 md:pt-28 max-w-6xl mx-auto px-6 md:px-12 pb-24">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-body text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <div className="space-y-8">
          {/* Order Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl text-foreground">
                Order Details
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-body text-sm text-muted-foreground">
                  Order ID:
                </span>
                <span className="font-mono text-sm text-foreground bg-secondary/20 px-2 py-1">
                  {order._id.slice(-8)}
                </span>
                <button
                  onClick={copyOrderId}
                  className="p-1 hover:bg-secondary/20 rounded transition-colors"
                  title="Copy full order ID"
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <span
              className={`px-4 py-2 border text-xs uppercase tracking-wider font-medium ${getStatusColor(
                order.status,
              )}`}
            >
              {order.status}
            </span>
          </div>

          {/* Customer Info */}
          <div className="border border-border p-6">
            <h2 className="font-display text-lg mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 text-foreground">
                  {order.fullName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 text-foreground">
                  {order.email || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <span className="ml-2 text-foreground">
                  {order.phone || "N/A"}
                </span>
              </div>
              {order.shippingAddress && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Shipping Address:</span>
                  <span className="ml-2 text-foreground">
                    {order.shippingAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-border">
            <h2 className="font-display text-lg p-6 border-b border-border">
              Order Items
            </h2>

            <div className="divide-y divide-border">
              {order.items.map((item, index) => (
                <div
                  key={`${item.itemId || index}-${item.size || "no-size"}`}
                  className="p-6 flex gap-4"
                >
                  <div className="w-20 h-24 bg-secondary/20 overflow-hidden flex-shrink-0">
                    <img
                      src={`/placeholder.png`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-base text-foreground">
                      {item.name}
                    </h3>
                    {item.size && (
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        Size: {item.size}
                      </p>
                    )}
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-display text-sm text-foreground mt-2">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-sm text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="p-6 border-t border-border bg-secondary/10">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-foreground">
                  Total
                </span>
                <span className="font-display text-xl text-foreground">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="border border-border p-6">
              <h2 className="font-display text-lg mb-2">Order Notes</h2>
              <p className="font-body text-sm text-foreground">{order.notes}</p>
            </div>
          )}

          {/* Contact Support */}
          <div className="border border-border p-6">
            <a
              href={`https://wa.me/2341234567890?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full md:w-auto px-6 py-3 bg-green-600 text-white font-body text-xs uppercase tracking-wider hover:bg-green-700 transition-colors justify-center"
            >
              <MessageCircle size={16} />
              Contact Support via WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;