import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";

const categories = ["cap", "shirts"];

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("admin-token");

  // Fetch existing item data
  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const fetchItem = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/items/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch item");
        const data = await res.json();
        setFormData({
          name: data.name ?? "",
          description: data.description ?? "",
          price: String(data.price ?? ""),
          category: data.category,
          imageUrl: data.imageUrl ?? "",
        });
        setImagePreview(data.imageUrl ?? null);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        alert("Failed to load item data");
        navigate("/admin/items");
      } finally {
        setIsFetching(false);
      }
    };

    fetchItem();
  }, [id, navigate, token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (value: string) => {
    const categoryValue = value === "none" ? null : value;
    setFormData((prev) => ({ ...prev, category: categoryValue }));
    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(formData.imageUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    // Category is now optional, so no validation needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // If new image selected, upload it first via multipart POST
      if (imageFile) {
        const uploadPayload = new FormData();
        uploadPayload.append("name", formData.name);
        uploadPayload.append("description", formData.description);
        uploadPayload.append("price", formData.price);
        uploadPayload.append("category", formData.category);
        uploadPayload.append("image", imageFile);

        const uploadRes = await api.post("/api/items", uploadPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImageUrl = uploadRes.data?.imageUrl ?? finalImageUrl;
      }

      // PATCH with JSON body per API spec
      await api.patch(`/api/items/${id}`, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: finalImageUrl,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/admin/items");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to update item:", err);
      console.error("Response data:", err.response?.data); // ADD THIS
      const message = err.response?.data?.message || "Failed to update item";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <p className="text-muted-foreground">Loading item data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-brand text-2xl mb-2">Edit Item</h1>
        <p className="text-muted-foreground mb-6">Update item details below</p>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            ✓ Item updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label>Item Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Price + Category */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Image */}
          <div>
            <Label>Image</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Current image shown below. Upload a new one to replace it.
            </p>

            {/* Current image preview */}
            {imagePreview && !imageFile && (
              <div className="relative mb-3">
                <img
                  src={imagePreview}
                  className="w-full h-48 object-cover rounded"
                  alt="Current"
                />
              </div>
            )}

            {/* New image preview */}
            {imageFile && imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  className="w-full h-48 object-cover rounded"
                  alt="New preview"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X />
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  New image selected — will replace current on save
                </p>
              </div>
            ) : (
              <div
                className="border p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors rounded"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a new image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}

            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-body uppercase tracking-[0.1em]"
            >
              {isSubmitting ? "Updating..." : "Update Item"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/items")}
              className="font-body uppercase tracking-[0.1em]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditItem;
