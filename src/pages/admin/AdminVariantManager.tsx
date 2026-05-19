import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Settings,
  Trash2,
  Edit,
  Upload,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AdminLayout from "@/components/admin/AdminLayout";
import { api, fetchProductWithVariants } from "@/lib/api";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";

/* ────────────────────────────────────────────────────────── */
/* Types */
/* ────────────────────────────────────────────────────────── */

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

interface Variant {
  _id: string;
  productId: string;
  color?: string;
  size?: string;
  image: string;
  stock: number;
  price: number;
  sku?: string;
  createdAt: string;
}

interface VariantFormData {
  color: string;
  size: string;
  stock: string;
  price: string;
  sku: string;
  imagePreview: string | null;
  imageFile: File | null;
}

const EMPTY_FORM: VariantFormData = {
  color: "",
  size: "",
  stock: "",
  price: "",
  sku: "",
  imagePreview: null,
  imageFile: null,
};

const AdminVariantManager = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("admin-token");

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<VariantFormData>({
    ...EMPTY_FORM,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);

  /* ──────────────────────────────────────────────────────── */
  /* Fetch */
  /* ──────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!token || !id) return;

    const load = async () => {
      try {
        const productData = await fetchProductWithVariants(id);
        setProduct(productData as unknown as Product);

        const res = await api.get(`/api/product-variants?productId=${id}`);
        setVariants(Array.isArray(res.data) ? res.data : []);
      } catch {
        navigate("/admin/items");
      } finally {
        setLoadingProduct(false);
      }
    };

    load();
  }, [id, token, navigate]);

  /* ──────────────────────────────────────────────────────── */
  /* Image */
  /* ──────────────────────────────────────────────────────── */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const clearImage = () => {
    setForm((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ──────────────────────────────────────────────────────── */
  /* Helpers */
  /* ──────────────────────────────────────────────────────── */

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  const startEdit = (variant: Variant) => {
    setEditingId(variant._id);

    setForm({
      color: variant.color ?? "",
      size: variant.size ?? "",
      stock: String(variant.stock ?? 0),
      price: String(variant.price ?? 0),
      sku: variant.sku ?? "",
      imagePreview: variant.image || null,
      imageFile: null,
    });

    setFormErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  /* ──────────────────────────────────────────────────────── */
  /* Validation */
  /* ──────────────────────────────────────────────────────── */

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.price || parseFloat(form.price) <= 0) {
      errs.price = "Price must be greater than 0";
    }

    if (!editingId && !form.imageFile) {
      errs.image = "Image is required";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ──────────────────────────────────────────────────────── */
  /* Submit */
  /* ──────────────────────────────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id || !token) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("productId", id);
      formData.append("price", form.price);

      if (form.color) formData.append("color", form.color);
      if (form.size) formData.append("size", form.size);
      if (form.stock) formData.append("stock", form.stock);
      if (form.sku) formData.append("sku", form.sku);

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const url = editingId
        ? `/api/product-variants/${editingId}`
        : `/api/product-variants`;

      if (editingId) {
        await api.patch(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const res = await api.get(`/api/product-variants?productId=${id}`);
      setVariants(Array.isArray(res.data) ? res.data : []);

      resetForm();
      setEditingId(null);

      alert(editingId ? "Updated successfully" : "Created successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save variant");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ──────────────────────────────────────────────────────── */
  /* Delete */
  /* ──────────────────────────────────────────────────────── */

  const handleDeleteConfirm = async () => {
    if (!variantToDelete) return;

    try {
      await api.delete(`/api/product-variants/${variantToDelete}`);

      const res = await api.get(`/api/product-variants?productId=${id}`);
      setVariants(Array.isArray(res.data) ? res.data : []);
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    }
  };

  /* ──────────────────────────────────────────────────────── */

  if (loadingProduct) {
    return (
      <AdminLayout>
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <p>Product not found</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex flex-col gap-1 mb-8">
        <button
          onClick={() => navigate("/admin/items")}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3">
          <Package size={24} />
          <h1 className="text-2xl">{product.name}</h1>
        </div>
      </div>

      {/* VARIANTS TABLE */}
      <div className="border rounded mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {variants.map((v) => (
              <TableRow key={v._id}>
                <TableCell>
                  <img src={v.image} className="w-12 h-12" />
                </TableCell>
                <TableCell>{v.color || "-"}</TableCell>
                <TableCell>{v.size || "-"}</TableCell>
                <TableCell>₦{v.price}</TableCell>
                <TableCell>{v.stock}</TableCell>

                <TableCell>
                  <Button onClick={() => startEdit(v)} size="sm">
                    <Edit size={14} />
                  </Button>

                  <Button
                    onClick={() => {
                      setVariantToDelete(v._id);
                      setDeleteDialogOpen(true);
                    }}
                    size="sm"
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ───────── FORM (RESTORED FULLY) ───────── */}
      <div className="border rounded p-6">
        <h2 className="mb-4">
          {editingId ? "Edit Variant" : "Add Variant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Color"
              value={form.color}
              onChange={(e) =>
                setForm((p) => ({ ...p, color: e.target.value }))
              }
            />

            <Input
              placeholder="Size"
              value={form.size}
              onChange={(e) =>
                setForm((p) => ({ ...p, size: e.target.value }))
              }
            />

            <Input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
            />

            <Input
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm((p) => ({ ...p, stock: e.target.value }))
              }
            />

            <Input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) =>
                setForm((p) => ({ ...p, sku: e.target.value }))
              }
            />
          </div>

          {/* IMAGE UPLOAD RESTORED */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />

            {!form.imagePreview ? (
              <div
                className="border p-4 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto" />
                Upload Image
              </div>
            ) : (
              <div className="relative w-20 h-20">
                <img
                  src={form.imagePreview}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-0 right-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {formErrors.image && (
              <p className="text-red-500 text-sm">
                {formErrors.image}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {editingId ? "Update" : "Create"}
          </Button>
        </form>
      </div>

      {/* DELETE MODAL */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Variant?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminVariantManager;