import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Edit, Trash, Mail, Calendar, UserCog } from "lucide-react";
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

// Dummy data for users
const dummyUsers = [
  { id: "USR-001", name: "John Doe", email: "john.doe@example.com", role: "Admin", joinedDate: "2023-06-15" },
  { id: "USR-002", name: "Jane Smith", email: "jane.smith@example.com", role: "Customer", joinedDate: "2023-07-20" },
  { id: "USR-003", name: "Mike Johnson", email: "mike.j@example.com", role: "Customer", joinedDate: "2023-08-10" },
  { id: "USR-004", name: "Sarah Wilson", email: "sarah.w@example.com", role: "VIP", joinedDate: "2023-09-05" },
  { id: "USR-005", name: "Tom Brown", email: "tom.b@example.com", role: "Customer", joinedDate: "2023-10-12" },
  { id: "USR-006", name: "Emily Davis", email: "emily.d@example.com", role: "Customer", joinedDate: "2023-11-18" },
  { id: "USR-007", name: "Chris Anderson", email: "chris.a@example.com", role: "VIP", joinedDate: "2023-12-01" },
  { id: "USR-008", name: "Amanda Taylor", email: "amanda.t@example.com", role: "Customer", joinedDate: "2024-01-05" },
  { id: "USR-009", name: "Robert Martinez", email: "robert.m@example.com", role: "Customer", joinedDate: "2024-01-20" },
  { id: "USR-010", name: "Lisa Garcia", email: "lisa.g@example.com", role: "Admin", joinedDate: "2024-02-01" },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-purple-500/10 text-purple-500";
    case "VIP":
      return "bg-yellow-500/10 text-yellow-500";
    default:
      return "bg-blue-500/10 text-blue-500";
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const Users = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(dummyUsers);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<typeof dummyUsers[0] | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const filtered = dummyUsers.filter(
      (user) =>
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm]);

  const handleDeleteClick = (user: typeof dummyUsers[0]) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      setFilteredUsers(filteredUsers.filter((u) => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
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
              Users Management
            </motion.h2>
            <Button size="sm" className="font-body text-xs uppercase tracking-[0.1em]">
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
                    placeholder="Search by User ID, Name, or Email..."
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
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                        User ID
                      </TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                        Email
                      </TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                        Joined Date
                      </TableHead>
                      <TableHead className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground w-24">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-border">
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
                        <TableCell className="font-body text-sm">{user.id}</TableCell>
                        <TableCell className="font-body text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className="font-body text-sm">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                              user.role
                            )}`}
                          >
                            <UserCog className="h-3 w-3" />
                            {user.role}
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {dummyUsers.length} users
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
