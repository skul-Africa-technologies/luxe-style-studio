import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("admin-token");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-gray-500">Loading order...</div>
      </AdminLayout>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */
  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">Order not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline"
        >
          ← Back
        </button>

        {/* TITLE */}
        <h1 className="text-2xl font-bold">
          Order #{order._id?.slice(-8)}
        </h1>

        {/* ---------------- CUSTOMER INFO ---------------- */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Customer</h2>
          <p>{order.fullName || "N/A"}</p>
          <p>{order.email || "N/A"}</p>
          <p>{order.phone || "N/A"}</p>
        </div>

        {/* ---------------- ORDER ITEMS ---------------- */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-4">Items</h2>

          {order.items?.length > 0 ? (
            order.items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex gap-4 border-b py-3 items-center"
              >
                {/* IMAGE (safe fallback) */}
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">
                      No img
                    </span>
                  )}
                </div>

                {/* DETAILS */}
                <div className="flex-1">
                  <p className="font-medium">
                    {item.name || "Unknown Item"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity || 1}
                  </p>

                  {item.size && (
                    <p className="text-sm text-gray-500">
                      Size: {item.size}
                    </p>
                  )}
                </div>

                {/* PRICE */}
                <p className="font-semibold">
                  ₦{(item.price || 0) * (item.quantity || 1)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              No item details available yet
            </p>
          )}

          {/* TOTAL */}
          <div className="flex justify-between mt-4 font-bold">
            <span>Total</span>
            <span>₦{order.total || 0}</span>
          </div>
        </div>

        {/* ---------------- RAW DEBUG (TEMP HELPFUL) ---------------- */}
        <div className="border p-3 text-xs bg-gray-50 rounded">
          <p className="font-semibold mb-2">Debug Order Data</p>
          <pre>{JSON.stringify(order, null, 2)}</pre>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetails;