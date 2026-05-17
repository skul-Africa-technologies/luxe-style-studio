import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
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

interface Slideshow {
  _id: string;
  imageUrl: string;
  title: string;
  displayText: string;
  order: number;
}

const SlideshowManagement = () => {
  const navigate = useNavigate();
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slideshowToDelete, setSlideshowToDelete] = useState<string | null>(null);

  const token = localStorage.getItem("admin-token");

// Fetch slideshows from API
   const fetchSlideshows = async (page = 1, search = "") => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/slideshow?limit=${itemsPerPage}&page=${page}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setSlideshows(data?.data ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to fetch slideshows:", err);
      setSlideshows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    fetchSlideshows(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle delete
  const handleDeleteClick = (id: string) => {
    setSlideshowToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!slideshowToDelete || !token) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/slideshow/${slideshowToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSlideshows(slideshows.filter((slideshow) => slideshow._id !== slideshowToDelete));
    } catch (err) {
      console.error("Failed to delete slideshow:", err);
    } finally {
      setDeleteDialogOpen(false);
      setSlideshowToDelete(null);
    }
  };

  // Handle edit (redirect to Edit page)
  const handleEdit = (id: string) => {
    navigate(`/admin/edit-slideshow/${id}`);
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="font-brand text-2xl text-foreground mb-2">Slideshow Management</h1>
          <p className="text-muted-foreground font-body">
            Manage your homepage slideshow/banner images
          </p>
        </div>
        <Link to="/admin/add-slideshow">
          <Button className="gap-2">
            <Plus size={18} />
            Add New Slideshow
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search slideshows..."
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
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Display Text</TableHead>
                <TableHead className="text-center w-16">Order</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (slideshows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="text-muted-foreground" size={24} />
                      </div>
                      <p className="text-muted-foreground font-body">
                        No slideshows found
                      </p>
                      <Link to="/admin/add-slideshow">
                        <Button variant="outline" size="sm" className="mt-2 gap-2">
                          <Plus size={16} />
                          Add your first slideshow
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                slideshows.map((slideshow) => (
                  <TableRow
                    key={slideshow._id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={slideshow.imageUrl}
                          alt={slideshow.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium font-body">{slideshow.title}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-muted-foreground font-body text-sm max-w-[200px] truncate">
                        {slideshow.displayText}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium font-body">
                        {slideshow.order}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(slideshow._id)}
                          className="hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(slideshow._id)}
                          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={16} />
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
               {Math.min(itemsPerPage * currentPage, (slideshows ?? []).length)} of {(slideshows ?? []).length} slideshows
             </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            <AlertDialogTitle>Delete Slideshow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this slideshow image? This action cannot be undone.
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

export default SlideshowManagement;