import { useState, useRef } from "react";
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

const categories = [
  "Dresses",
  "Suits",
  "Casual Wear",
  "Formal Wear",
  "Accessories",
  "Footwear",
];

const CLOUDINARY_UPLOAD_PRESET = "frontend_upload";
const CLOUDINARY_CLOUD_NAME = "dtiqu4sre";

// ✅ BASE URL (PRO FIX)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("admin-token");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    uploadToCloudinary(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!imageUrl) newErrors.image = "Please upload an image";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ CLOUDINARY UPLOAD
  const uploadToCloudinary = async (file: File) => {
    try {
      setImageUploading(true);

      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: form },
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
      removeImage();
    } finally {
      setImageUploading(false);
    }
  };

  // ✅ SUBMIT (FIXED BASE URL)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (imageUploading) {
    alert("Image still uploading...");
    return;
  }

  if (!imageUrl) {
    alert("Please upload image first");
    return;
  }

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    await api.post("/items", {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      imageUrl,
    });

    setShowSuccess(true);

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
    });

    removeImage();

    setTimeout(() => setShowSuccess(false), 3000);
  } catch (err) {
    console.error(err);
    alert("Failed to add item");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-brand text-2xl mb-2">Add New Item</h1>
        <p className="text-muted-foreground mb-6">
          Fill in item details below
        </p>

        {imageUploading && (
          <div className="h-1 w-full bg-blue-500 mb-4 animate-pulse" />
        )}

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            ✓ Item added successfully!
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
            {errors.name && <p className="text-red-500">{errors.name}</p>}
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
              <p className="text-red-500">{errors.description}</p>
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
              {errors.price && <p className="text-red-500">{errors.price}</p>}
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
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Image</Label>

            {!imagePreview ? (
              <div
                className="border p-8 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-2" />
                Click to upload
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  className="w-full h-48 object-cover rounded"
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X />
                </Button>
              </div>
            )}

            {errors.image && <p className="text-red-500">{errors.image}</p>}
          </div>

          <Button disabled={isSubmitting || imageUploading}>
            {isSubmitting ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddItem;