import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  LogOut,
} from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import AnalyticsCard from "@/components/admin/AnalyticsCard";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------------- TYPES ---------------- */

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface RecentOrder {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  items: OrderItem[];
  deliveryAddress: string;
  googleMapsLink: string;
  shippingAddress: string;
}

interface DashboardData {
  totalSales: number;
  totalUsers: number;
  totalOrders: number;
  totalItems: number;
  recentOrders: RecentOrder[];

  analytics: {
    orders: {
      today: number;
      yesterday: number;
      trend: number;
    };

    sales: {
      today: number;
      yesterday: number;
      trend: number;
    };

    weeklyOrders: {
      thisWeek: number;
      lastWeek: number;
      trend: number;
    };
  };
}

/* ---------------- COMPONENT ---------------- */

const Dashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData>({
    totalSales: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalItems: 0,
    recentOrders: [],
    analytics: {
      orders: { today: 0, yesterday: 0, trend: 0 },
      sales: { today: 0, yesterday: 0, trend: 0 },
      weeklyOrders: { thisWeek: 0, lastWeek: 0, trend: 0 },
    },
  });

  const [loading, setLoading] = useState(true);

  // Prevent unnecessary re-render
  const lastDataRef = useRef<string>("");

  /* ---------------- FETCH DASHBOARD ---------------- */

  useEffect(() => {
    const token = localStorage.getItem("admin-token");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

     const fetchDashboard = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`, {
            headers: {
             Authorization: `Bearer ${token}`,
           },
         });

        if (!res.ok) throw new Error("Failed to fetch dashboard data");

        const json = await res.json();

        // Only update state if response changed
        const newDataString = JSON.stringify(json);

        if (newDataString !== lastDataRef.current) {
          lastDataRef.current = newDataString;
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);

        localStorage.removeItem("admin-token");
        navigate("/admin/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchDashboard();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    navigate("/admin/login", { replace: true });
  };

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout>
      {/* Logout */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 font-body text-xs uppercase tracking-[0.1em]"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-center font-body text-sm text-muted-foreground">
          Loading dashboard...
        </p>
      ) : (
        <div className="space-y-6">
          {/* ---------------- STATS GRID ---------------- */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Sales Today */}
            <AnalyticsCard
              title="Sales Today"
              value={`$${data.analytics.sales.today.toLocaleString()}`}
              icon={DollarSign}
              trend={`${data.analytics.sales.trend.toFixed(1)}%`}
              trendUp={data.analytics.sales.trend >= 0}
            />

            {/* Total Users */}
            <AnalyticsCard
              title="Total Users"
              value={data.totalUsers.toLocaleString()}
              icon={Users}
              trend="--"
              trendUp
            />

            {/* Orders Today */}
            <AnalyticsCard
              title="Orders Today"
              value={data.analytics.orders.today.toLocaleString()}
              icon={ShoppingCart}
              trend={`${data.analytics.orders.trend.toFixed(1)}%`}
              trendUp={data.analytics.orders.trend >= 0}
            />

            {/* Weekly Orders */}
            <AnalyticsCard
              title="Orders This Week"
              value={data.analytics.weeklyOrders.thisWeek.toLocaleString()}
              icon={TrendingUp}
              trend={`${data.analytics.weeklyOrders.trend.toFixed(1)}%`}
              trendUp={data.analytics.weeklyOrders.trend >= 0}
            />
          </div>

          {/* ---------------- RECENT ORDERS ---------------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-brand text-lg">
                  Recent Orders
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Delivery Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No recent orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.recentOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>{order._id.slice(0, 8)}...</TableCell>

                          <TableCell>
                            {order.fullName || order.email || "Unknown"}
                          </TableCell>

                          <TableCell>{order.email || "-"}</TableCell>

                          <TableCell>{order.phone || "-"}</TableCell>

                          <TableCell>
                            {order.items?.length || 0} item(s)
                          </TableCell>

                          <TableCell className="max-w-xs">
                            <div className="truncate" title={order.deliveryAddress}>
                              {order.deliveryAddress || order.shippingAddress || "-"}
                            </div>
                            {order.googleMapsLink && (
                              <a
                                href={order.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                View Map
                              </a>
                            )}
                          </TableCell>

                          <TableCell>
                            ${order.total.toLocaleString()}
                          </TableCell>

                          <TableCell className="capitalize">
                            {order.status}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
