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
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await res.json();

        // API returns direct object
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-gray-500">
          Loading order...
        </div>
      </AdminLayout>
    );
  }

  /* ---------------- EMPTY ---------------- */
  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">
          Order not found
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline"
        >
          ← Back
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Order #{order._id?.slice(-8)}
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* STATUS */}
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium
                ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {order.status || "pending"}
            </span>

            {/* PAYMENT */}
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium
                ${
                  order.isPaid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }
              `}
            >
              {order.isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">
            Customer Information
          </h2>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {order.fullName ||
                order.userId?.name ||
                "N/A"}
            </p>

            <p>
              <span className="font-medium">Email:</span>{" "}
              {order.email ||
                order.userId?.email ||
                "N/A"}
            </p>

            <p>
              <span className="font-medium">Phone:</span>{" "}
              {order.phone ||
                order.userId?.phone ||
                "N/A"}
            </p>

            <p>
              <span className="font-medium">
                Delivery Address:
              </span>{" "}
              {order.deliveryAddress ||
                order.shippingAddress ||
                order.userId?.address ||
                "N/A"}
            </p>

            {order.notes && (
              <p>
                <span className="font-medium">Notes:</span>{" "}
                {order.notes}
              </p>
            )}
          </div>
        </div>

        {/* ORDER ITEMS */}
        <div className="border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-5">
            Order Items
          </h2>

          {order.items?.length > 0 ? (
            <div className="space-y-4">
              {order.items.map(
                (item: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-4 border rounded-lg p-4"
                  >

                    {/* IMAGE */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          No image
                        </span>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {item.name ||
                          item.slug ||
                          "Unknown Product"}
                      </h3>

                      {item.category && (
                        <p className="text-sm text-gray-500">
                          Category: {item.category}
                        </p>
                      )}

                      <div className="mt-2 space-y-1 text-sm text-gray-600">

                        <p>
                          Quantity:{" "}
                          {item.quantity || 1}
                        </p>

                        {item.size && (
                          <p>
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p>
                            Color: {item.color}
                          </p>
                        )}

                        {item.slug && (
                          <p>
                            Slug: {item.slug}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ₦
                        {(
                          (item.price || 0) *
                          (item.quantity || 1)
                        ).toLocaleString()}
                      </p>

                      <p className="text-sm text-gray-500">
                        ₦
                        {(
                          item.price || 0
                        ).toLocaleString()}{" "}
                        each
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* TOTAL */}
              <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                <span>Total</span>

                <span>
                  {order.currency || "₦"}
                  {Number(
                    order.total || 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No items found
            </p>
          )}
        </div>

        {/* DEBUG */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <p className="font-semibold mb-3 text-sm">
            Debug Order Data
          </p>

          <pre className="text-xs overflow-auto">
            {JSON.stringify(order, null, 2)}
          </pre>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetails;