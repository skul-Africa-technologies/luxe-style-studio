import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const token = localStorage.getItem("admin-token");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setOrder(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6">Loading order...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <button onClick={() => navigate(-1)} className="text-sm underline">
          ← Back
        </button>

        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>

        {/* Customer Info */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Customer</h2>
          <p>{order.fullName}</p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
        </div>

        {/* Items */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-4">Items</h2>

          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex gap-4 border-b py-3">
              
              {/* IMAGE (IMPORTANT PART YOU WANTED) */}
              {item.image && (
                <img
                  src={item.image}
                  className="w-16 h-16 object-cover rounded"
                />
              )}

              <div className="flex-1">
                <p className="font-medium">{item.name}</p>

                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>

                {/* SIZE */}
                {item.size && (
                  <p className="text-sm text-gray-500">
                    Size: {item.size}
                  </p>
                )}
              </div>

              <p className="font-semibold">
                ₦{item.price * item.quantity}
              </p>
            </div>
          ))}

          <div className="flex justify-between mt-4 font-bold">
            <span>Total</span>
            <span>₦{order.total}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetails;