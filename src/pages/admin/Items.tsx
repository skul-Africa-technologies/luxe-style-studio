import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const Items = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const token = localStorage.getItem("admin-token");

  // Fetch items from API
  const fetchItems = async (page = 1, search = "") => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/items?limit=${itemsPerPage}&page=${page}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setItems(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    fetchItems(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Truncate description to 50 characters
  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Handle delete
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !token) return;
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/items/${itemToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setItems(items.filter((item) => item._id !== itemToDelete));
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Handle edit (redirect to Edit page)
  const handleEdit = (id: string) => {
    navigate(`/admin/edit-item/${id}`);
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="font-brand text-2xl text-foreground mb-2">Items</h1>
          <p className="text-muted-foreground font-body">
            Manage and organize your product catalog
          </p>
        </div>
        <Link to="/admin/add-item">
          <Button className="gap-2">
            <Plus size={18} />
            Add New Item
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
             <TableHeader>
               <TableRow className="bg-muted/50">
                 <TableHead className="w-20">Thumbnail</TableHead>
                 <TableHead>Name</TableHead>
                 <TableHead className="hidden md:table-cell">
                   Description
                 </TableHead>
                 <TableHead>Price</TableHead>
                 <TableHead className="hidden lg:table-cell">Category</TableHead>
                 <TableHead className="text-right w-36">Actions</TableHead>
               </TableRow>
             </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="text-muted-foreground" size={24} />
                      </div>
                      <p className="text-muted-foreground font-body">
                        No items found
                      </p>
                      <Link to="/admin/add-item">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-2"
                        >
                          <Plus size={16} />
                          Add your first item
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item._id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium font-body">{item.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-muted-foreground font-body text-sm max-w-[200px] truncate">
                        {truncateDescription(item.description, 50)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium font-body">
                        ₦{item.price.toLocaleString("en-NG")}
                      </div>
</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {item.category ?? 'None'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item._id)}
                            className="hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item._id)}
                            className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-8 text-xs rounded-full"
                            onClick={() => navigate(`/admin/manage-variants/${item._id}`)}
                          >
                            <Settings size={12} />
                            Manage Variants
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground font-body">
              Showing {itemsPerPage * (currentPage - 1) + 1} to{" "}
              {Math.min(itemsPerPage * currentPage, items.length)} of{" "}
              {items.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm font-body text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Items;
