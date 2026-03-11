import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Edit, Trash, Mail, Calendar, UserCog, Phone, Package } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Route protection: Check for admin token
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

// User type from API
interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  role: string;
  orderCount: number;
  createdAt: string;
  isActive: boolean;
}

// Display user type
interface DisplayUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  orderCount: number;
  joinedDate: string;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-500/10 text-purple-500";
    case "VIP":
    case "vip":
      return "bg-yellow-500/10 text-yellow-500";
    default:
      return "bg-blue-500/10 text-blue-500";
  }
};

const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<DisplayUser[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DisplayUser | null>(null);
  const token = localStorage.getItem("admin-token");

  // Fetch users from API
  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const mappedUsers: DisplayUser[] = (data.data || []).map((u: User) => ({
        _id: u._id,
        name: u.name || "Unknown",
        email: u.email || "",
        phone: u.phone || "—",
        role: u.role || "customer",
        orderCount: u.orderCount || 0,
        joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) : "—",
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchUsers();
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleDeleteClick = (user: DisplayUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !token) return;
    
    try {
      const res = await fetch(`http://localhost:3001/users/${userToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setFilteredUsers(filteredUsers.filter((u) => u._id !== userToDelete._id));
        setUsers(users.filter((u) => u._id !== userToDelete._id));
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
    
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const formatRole = (role: string) => {
    if (role === "admin") return "Admin";
    if (role === "vip") return "VIP";
    return "Customer";
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
              Users Management
            </motion.h2>
            <Button size="sm" className="font-body text-xs uppercase tracking-[0.1em]" disabled>
              Add New User
            </Button>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Name or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 font-body text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-brand text-lg">All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground font-body">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <UserCog className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      {searchTerm ? "No users match your search" : "No users found"}
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
                        <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          User
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Email
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Phone
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Total Orders
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Role
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Date Joined
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground w-24">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id} className="border-border">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary font-body text-sm">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-body text-sm font-medium">
                                {user.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {user.phone}
                            </div>
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {user.orderCount}
                            </div>
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                user.role
                              )}`}
                            >
                              <UserCog className="h-3 w-3" />
                              {formatRole(user.role)}
                            </span>
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {user.joinedDate}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground"
                                title="Edit User"
                                disabled
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                title="Delete User"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="font-body text-xs">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="font-body text-xs" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-brand">Confirm Delete</DialogTitle>
              <DialogDescription className="font-body">
                Are you sure you want to delete user{" "}
                <span className="font-medium">{userToDelete?.name}</span>? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="font-body text-xs uppercase tracking-[0.1em]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="font-body text-xs uppercase tracking-[0.1em]"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Users;
