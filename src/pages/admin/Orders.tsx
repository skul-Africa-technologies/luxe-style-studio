import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, Calendar, MapPin, Package, User, Mail, Phone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Route protection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) navigate("/admin/login", { replace: true });
  }, [navigate]);
  return <>{children}</>;
};

// Order item type from backend
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}


// Full order type from backend
interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  googleMapsLink?: string;
  notes: string;
  createdAt: string;
}

// Display order type (with computed fields)
interface DisplayOrder {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  statusDisplay: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  googleMapsLink?: string;
  notes: string;
  createdAt: string;
  date: string;
}

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500/10 text-green-500";
    case "processing":
      return "bg-blue-500/10 text-blue-500";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500";
    case "cancelled":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

// Get next status in workflow
const getNextStatus = (currentStatus: string): string | null => {
  const statusFlow: Record<string, string> = {
    pending: "processing",
    processing: "completed",
  };
  return statusFlow[currentStatus.toLowerCase()] || null;
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<DisplayOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const token = localStorage.getItem("admin-token");

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const mappedOrders: DisplayOrder[] = (data.data || []).map((o: Order) => ({
        _id: o._id,
        items: o.items || [],
        total: o.total || 0,
        status: o.status,
        statusDisplay: o.status.charAt(0).toUpperCase() + o.status.slice(1),
        shippingAddress: o.shippingAddress || "N/A",
        notes: o.notes || "",
        createdAt: o.createdAt,
        date: new Date(o.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }));

      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order._id.toLowerCase().includes(term) ||
        order.shippingAddress.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  // View order details
  const handleViewDetails = (order: DisplayOrder) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  // Cancel order
  const handleCancelOrder = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:3001/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      await fetchOrders();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Could not cancel order");
    } finally {
      setActionLoading(null);
    }
  };

  // Update order status
  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:3001/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Could not update order status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-brand text-2xl text-foreground"
            >
              Orders Management
            </motion.h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="font-body text-xs uppercase tracking-[0.1em]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" className="font-body text-xs uppercase tracking-[0.1em]">
                Export
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Order ID or Customer Address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-body text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-brand text-lg">All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground font-body">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-body text-sm">
                    {searchTerm ? "No orders match your search" : "No orders found"}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="font-body text-xs"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">Order ID</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">Customer</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">Date</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">Status</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">Items</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">Total</TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id} className="border-border hover:bg-muted/50 transition-colors">
                        <TableCell className="font-body text-sm text-foreground font-mono">
                          {order._id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="font-body text-sm text-foreground">
                          <div className="space-y-0.5">
                            <p className="font-medium">{order.customerName || "—"}</p>
                            {order.customerEmail && (
                              <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-body text-sm text-foreground">
                          {order.date}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.statusDisplay
                            )}`}
                          >
                            {order.statusDisplay}
                          </span>
                        </TableCell>
                        <TableCell className="font-body text-sm text-foreground">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="font-body text-sm text-foreground font-medium">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={actionLoading !== null}
                              >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                View Details
                              </DropdownMenuItem>
                              {getNextStatus(order.status) && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(order._id, order.status)}
                                  disabled={actionLoading === order._id}
                                >
                                  {actionLoading === order._id ? "Updating..." : `Mark as ${getNextStatus(order.status)}`}
                                </DropdownMenuItem>
                              )}
                              {order.status.toLowerCase() !== "cancelled" && order.status.toLowerCase() !== "completed" && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={actionLoading === order._id}
                                >
                                  {actionLoading === order._id ? "Cancelling..." : "Cancel Order"}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="font-body text-xs">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="font-body text-xs">
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-brand text-xl">Order Details</DialogTitle>
              <DialogDescription className="font-body text-sm">
                Full information for order {selectedOrder?._id.slice(-8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info Card */}
                {(selectedOrder.customerName || selectedOrder.customerEmail || selectedOrder.customerPhone) && (
                  <Card className="border-border bg-muted/30">
                    <CardContent className="pt-6 space-y-3">
                      <h4 className="font-brand text-sm uppercase tracking-[0.1em] text-muted-foreground mb-2">Customer Information</h4>
                      {selectedOrder.customerName && (
                        <div className="flex items-center gap-2 text-foreground">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-body text-sm font-medium">{selectedOrder.customerName}</span>
                        </div>
                      )}
                      {selectedOrder.customerEmail && (
                        <div className="flex items-center gap-2 text-foreground">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${selectedOrder.customerEmail}`} className="font-body text-sm hover:underline">{selectedOrder.customerEmail}</a>
                        </div>
                      )}
                      {selectedOrder.customerPhone && (
                        <div className="flex items-center gap-2 text-foreground">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${selectedOrder.customerPhone}`} className="font-body text-sm hover:underline">{selectedOrder.customerPhone}</a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Order Info Card */}
                <Card className="border-border bg-muted/30">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="font-body text-sm">{selectedOrder.date}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedOrder.statusDisplay
                        )}`}
                      >
                        {selectedOrder.statusDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="font-body text-sm">{selectedOrder.shippingAddress}</span>
                    </div>

                    {/* Delivery Location with Map */}
                    {selectedOrder.deliveryAddress && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-foreground" />
                          <span className="font-body text-sm font-medium text-foreground">Delivery Location</span>
                        </div>
                        <p className="font-body text-sm text-foreground pl-6">
                          {selectedOrder.deliveryAddress}
                        </p>
                        {selectedOrder.deliveryLat && selectedOrder.deliveryLng && (
                          <div className="rounded-lg overflow-hidden border border-border">
                            <iframe
                              src={`https://www.google.com/maps?q=${selectedOrder.deliveryLat},${selectedOrder.deliveryLng}&output=embed`}
                              width="100%"
                              height="200"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title="Delivery Location Map"
                            />
                          </div>
                        )}
                        {selectedOrder.googleMapsLink && (
                          <a
                            href={selectedOrder.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.1em] uppercase text-foreground hover:text-muted-foreground transition-colors pl-6"
                          >
                            <MapPin className="h-3 w-3" />
                            Open in Google Maps →
                          </a>
                        )}
                      </div>
                    )}

                    {selectedOrder.notes && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground font-body uppercase tracking-[0.05em] mb-1">Notes</p>
                        <p className="font-body text-sm">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                <div>
                  <h4 className="font-brand text-lg mb-3">Ordered Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="font-body text-xs uppercase tracking-[0.05em] text-muted-foreground">Item</TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.05em] text-muted-foreground text-center">Qty</TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.05em] text-muted-foreground text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index} className="border-border">
                          <TableCell className="font-body text-sm text-foreground">
                            {item.name}
                          </TableCell>
                          <TableCell className="font-body text-sm text-foreground text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="font-body text-sm text-foreground text-right">
                            ${item.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Total */}
                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm text-muted-foreground">Total:</span>
                      <span className="font-brand text-xl font-semibold text-foreground">
                        ${selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="font-body text-xs uppercase tracking-[0.1em]"
              >
                Close
              </Button>
              {selectedOrder && selectedOrder.status.toLowerCase() !== "cancelled" && selectedOrder.status.toLowerCase() !== "completed" && (
                <Button
                  variant="destructive"
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  disabled={actionLoading === selectedOrder._id}
                  className="font-body text-xs uppercase tracking-[0.1em]"
                >
                  {actionLoading === selectedOrder._id ? "Cancelling..." : "Cancel Order"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Orders;
