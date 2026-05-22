import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Plus, Trash2 } from "lucide-react";
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

interface Variant {
  _id?: string;
  color: string;
  size: string;
  stock: number;
  price: number;
}

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    color: "",
    size: "",
    stock: "",
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("admin-token");

  /* FETCH ITEM */
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
          }
        );

        if (!res.ok) throw new Error("Failed to fetch item");

        const data = await res.json();

        setFormData({
          name: data.name ?? "",
          description: data.description ?? "",
          price: String(data.price ?? ""),
          category: data.category ?? "",
          imageUrl: data.imageUrl ?? "",
          color: data.color ?? "",
          size: data.size ?? "",
          stock: String(data.stock ?? ""),
        });

        setVariants(data.variants ?? []);
        setImagePreview(data.imageUrl ?? null);
      } catch (err) {
        console.error(err);
        alert("Failed to load item");
        navigate("/admin/items");
      } finally {
        setIsFetching(false);
      }
    };

    fetchItem();
  }, [id]);

  /* INPUT */
  const handleInputChange = (e: any) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((p) => ({ ...p, category: value === "none" ? "" : value }));
  };

  /* IMAGE */
  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* VALIDATION */
  const validate = () => {
    if (!formData.name || !formData.description) return false;
    if (Number(formData.price) <= 0) return false;
    return true;
  };

  /* SUBMIT */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;

      /* ✅ FIXED IMAGE UPLOAD ENDPOINT */
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);

        const uploadRes = await api.post(
          "/api/items/upload-image",
          uploadData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        finalImageUrl = uploadRes.data.url;
      }

      /* ✅ ONLY SEND BACKEND-VALID FIELDS */
      await api.patch(`/api/items/${id}`, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category || null,
        imageUrl: finalImageUrl,

        /* these are allowed in DTO */
        color: formData.color || null,
        size: formData.size || null,
        stock: Number(formData.stock || 0),
      });

      setShowSuccess(true);

      setTimeout(() => navigate("/admin/items"), 1200);
    } catch (err: any) {
      console.error("Update failed:", err?.response?.data);
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Edit Item</h1>

        {showSuccess && (
          <div className="p-3 bg-green-100 border rounded">
            Updated successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" />

          <Textarea name="description" value={formData.description} onChange={handleInputChange} />

          <Input type="number" name="price" value={formData.price} onChange={handleInputChange} />

          <Select value={formData.category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-3 gap-3">
            <Input name="color" value={formData.color} onChange={handleInputChange} placeholder="Color" />
            <Input name="size" value={formData.size} onChange={handleInputChange} placeholder="Size" />
            <Input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Stock" />
          </div>

          {/* IMAGE */}
          <div onClick={() => fileInputRef.current?.click()} className="border p-4 cursor-pointer">
            <Upload />
            <input hidden ref={fileInputRef} type="file" onChange={handleImageChange} />
          </div>

          {imagePreview && (
            <img src={imagePreview} className="w-full h-48 object-cover" />
          )}

          <Button disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Item"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditItem;