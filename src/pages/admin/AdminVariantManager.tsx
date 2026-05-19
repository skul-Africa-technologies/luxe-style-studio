import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  api,
  fetchProductWithVariants,
  uploadVariantImage,
} from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────────────────────── */

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

  /* ── Product state ──────────────────────────────────────────────────────── */
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(true);

  /* ── Add / edit variant form state ───────────────────────────────────────── */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VariantFormData>({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Image upload via Cloudinary (using the products /items upload endpoint) */
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Delete dialog ──────────────────────────────────────────────────────── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);

  /* ── Fetch product + variants ───────────────────────────────────────────── */
  useEffect(() => {
    if (!token || !id) return;

    const load = async () => {
      try {
        const productData = await fetchProductWithVariants(id);
        setProduct(productData as unknown as Product);
        const res = await api.get(`/api/product-variants?productId=${id}`);
        const variantList = Array.isArray(res.data) ? res.data : [];
        setVariants(variantList);
      } catch {
        navigate("/admin/items");
      } finally {
        setLoadingProduct(false);
        setLoadingVariants(false);
      }
    };

    load();
  }, [id, token, navigate]);

  /* ── Image change handler ─────────────────────────────────────────────────- */
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

  /* ── Form helpers ─────────────────────────────────────────────────────────- */
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

  /* ── Validation ──────────────────────────────────────────────────────────── */
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

  /* ── Create / Update submit ──────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id || !token) return;

    setIsSubmitting(true);

    try {
      let imageUrl = form.imagePreview ?? "";

      // If a new file was selected, upload it first to get the Cloudinary URL
      if (form.imageFile) {
        setUploadingImage(true);
        const uploaded = await uploadVariantImage(form.imageFile);
        imageUrl = uploaded.url;
        setUploadingImage(false);
      }

      const payload = {
        productId: id,
        color: form.color || undefined,
        size: form.size || undefined,
        stock: parseInt(form.stock, 10) || 0,
        price: parseFloat(form.price),
        sku: form.sku || undefined,
        image: imageUrl, // string URL
      };

      if (editingId) {
        await api.patch(`/api/product-variants/${editingId}`, payload);
      } else {
        await api.post("/api/product-variants", payload);
      }

      const res = await api.get(`/api/product-variants?productId=${id}`);
      const variantList = Array.isArray(res.data) ? res.data : [];
      setVariants(variantList);
      setEditingId(null);
      resetForm();
      alert(editingId ? "Variant updated successfully!" : "Variant added successfully!");
    } catch (err: unknown) {
      console.error("Variant error:", err);
      console.error("Response:", (err as any)?.response?.data);
      alert((err as any)?.response?.data?.message || "Failed to save variant");
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  /* ── Delete ──────────────────────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!variantToDelete || !token) return;
    try {
      await api.delete(`/api/product-variants/${variantToDelete}`);
      if (id) {
        const res = await api.get(`/api/product-variants?productId=${id}`);
        const variantList = Array.isArray(res.data) ? res.data : [];
        setVariants(variantList);
      }
    } catch {
      alert("Failed to delete variant");
    } finally {
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    }
  };

  /* ── Derived ─────────────────────────────────────────────────────────────── */
  const isEditing = editingId !== null;

  /* ── Render helpers ──────────────────────────────────────────────────────── */
  if (loadingProduct) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Loading product...</p>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <p className="text-red-500">Product not found</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 mb-8">
        <button
          onClick={() => navigate("/admin/items")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          <ArrowLeft size={16} />
          Back to Items
        </button>

        <div className="flex items-center gap-3">
          <Package size={24} />
          <div>
            <h1 className="font-brand text-2xl text-foreground">
              {product.name}
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              Manage color / size variants for this product
            </p>
          </div>
        </div>
      </div>

      {/* ── Variant list ────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-lg bg-card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-brand text-sm uppercase tracking-[0.1em]">
            Variants ({variants.length})
          </h2>
        </div>

        {variants.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Settings className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p>No variants yet</p>
            <p className="text-sm mt-1">Add your first variant below</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant._id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="w-14 h-14 rounded overflow-hidden bg-muted">
                      <img
                        src={variant.image}
                        alt={variant.color ?? "Variant"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-body">{variant.color ?? "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-body font-medium">
                      {variant.size ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">
                    {variant.sku ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-body">
                    ₦{variant.price.toLocaleString("en-NG")}
                  </TableCell>
                  <TableCell className="text-right font-body">
                    <span
                      className={
                        variant.stock === 0
                          ? "text-red-500"
                          : variant.stock <= 5
                            ? "text-amber-600"
                            : "text-green-600"
                      }
                    >
                      {variant.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(variant)}
                        className="h-8 w-8 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setVariantToDelete(variant._id);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Add / Edit variant form ─────────────────────────────────────────── */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-brand text-sm uppercase tracking-[0.1em]">
            {isEditing ? "Edit Variant" : "Add New Variant"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Color */}
            <div>
              <Label>Color</Label>
              <Input
                placeholder="e.g. Black"
                value={form.color}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, color: e.target.value }))
                }
              />
            </div>

            {/* Size */}
            <div>
              <Label>Size</Label>
              <Input
                placeholder="e.g. Medium"
                value={form.size}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, size: e.target.value }))
                }
              />
            </div>

            {/* Price */}
            <div>
              <Label>Price (₦)</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
              {formErrors.price && (
                <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.stock}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
            </div>
          </div>

          {/* SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>SKU (optional)</Label>
              <Input
                placeholder="e.g. DG-SHIRT-BLK-M"
                value={form.sku}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sku: e.target.value }))
                }
              />
            </div>

            {/* Image */}
            <div>
              <Label>Variant Image *</Label>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
              {!form.imagePreview ? (
                <div
                  className="border rounded p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload image</p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={form.imagePreview}
                    alt="Variant preview"
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={clearImage}
                  >
                    <X size={12} />
                  </Button>
                </div>
              )}
              {formErrors.image && (
                <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>
              )}
            </div>
          </div>

           <div className="flex flex-wrap gap-3 pt-2">
             {isEditing ? (
               <>
                 <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting ? "Saving…" : "Save Changes"}
                 </Button>
                 <Button type="button" variant="outline" onClick={cancelEdit}>
                   Cancel
                 </Button>
               </>
             ) : (
               <>
                 <Button type="submit" disabled={isSubmitting || uploadingImage}>
                   {uploadingImage
                     ? "Uploading image…"
                     : isSubmitting
                       ? "Adding…"
                       : "Add Variant"}
                 </Button>
                 <Button type="button" variant="outline" onClick={cancelEdit}>
                   Cancel
                 </Button>
               </>
             )}
           </div>
        </form>
      </div>

      {/* ── Delete confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot
              be undone.
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

export default AdminVariantManager;
