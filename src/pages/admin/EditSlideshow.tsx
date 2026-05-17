import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";

const EditSlideshow = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    title: "",
    displayText: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing slideshow data
  useEffect(() => {
    const fetchSlideshow = async () => {
      const token = localStorage.getItem("admin-token");
      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/slideshow/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch slideshow");
        }
        const data = await res.json();
        setFormData({
          title: data.title,
          displayText: data.displayText,
        });
        setImagePreview(data.imageUrl); // Preview existing image
      } catch (err) {
        console.error("Failed to fetch slideshow:", err);
        alert("Failed to load slideshow data");
        navigate("/admin/slideshow");
      }
    };

    fetchSlideshow();
  }, [id, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
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
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.displayText.trim())
      newErrors.displayText = "Display text is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Build FormData for multipart upload
      const formDataPayload = new FormData();
      formDataPayload.append("title", formData.title);
      formDataPayload.append("displayText", formData.displayText);
      if (imageFile) {
        formDataPayload.append("image", imageFile);
      }

      // Send to backend - update slideshow
      await api.patch(`/slideshow/${id}`, formDataPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate("/admin/slideshow");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to update slideshow:", err);
      const message = err.response?.data?.message || "Failed to update slideshow";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-brand text-2xl mb-2">Edit Slideshow Image</h1>
        <p className="text-muted-foreground mb-6">
          Update slideshow details below
        </p>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            ✓ Slideshow image updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          {/* Display Text */}
          <div>
            <Label>Display Text</Label>
            <Textarea
              name="displayText"
              value={formData.displayText}
              onChange={handleInputChange}
            />
            {errors.displayText && (
              <p className="text-red-500 text-sm">{errors.displayText}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label>Image</Label>

            {!imagePreview ? (
              <div
                className="border p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
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
                  alt="Preview"
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
              </div>
            )}

            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-body uppercase tracking-[0.1em]"
            >
              {isSubmitting ? "Updating..." : "Update Slideshow"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/slideshow")}
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

export default EditSlideshow;