"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type SubCat = { name: string; category: string };

export default function NewProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLinkInput, setImageLinkInput] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryLinkInput, setGalleryLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<SubCat[]>([]);

  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    salePrice: "",
    category: "",
    description: "",
    inStock: "true",
  });

  useEffect(() => {
    fetch("/api/admin/sub-categories", { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCategories(data));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/admin/products/upload-image", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل الرفع");
    return data.url;
  }

  async function handleMainImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setImageLinkInput("");
      toast.success("تم رفع الصورة ✅");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصورة");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  }

  function handleMainImageLink() {
    const link = imageLinkInput.trim();
    if (!link) return;
    setImageUrl(link);
    setImagePreview(link);
    setImageLinkInput("");
    toast.success("تم إضافة رابط الصورة ✅");
  }

  function clearMainImage() {
    setImageUrl("");
    setImagePreview("");
    setImageLinkInput("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleGalleryFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    try {
      const url = await uploadImage(file);
      setGalleryImages((prev) => [...prev, url]);
      toast.success("تم رفع صورة الجاليري ✅");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setGalleryUploading(false);
      if (galleryFileRef.current) galleryFileRef.current.value = "";
    }
  }

  function handleGalleryLink() {
    const link = galleryLinkInput.trim();
    if (!link) return;
    setGalleryImages((prev) => [...prev, link]);
    setGalleryLinkInput("");
    toast.success("تم إضافة رابط الصورة ✅");
  }

  function removeGalleryImage(index: number) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.originalPrice) return toast.error("الاسم والسعر مطلوبان");
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        originalPrice: Number(form.originalPrice),
        price: Number(form.salePrice || form.originalPrice),
        category: form.category,
        description: form.description,
        inStock: form.inStock === "true",
      };
      if (form.salePrice) body.salePrice = Number(form.salePrice);
      if (imageUrl) body.image = imageUrl;
      const allImages = imageUrl ? [imageUrl, ...galleryImages] : [...galleryImages];
      if (allImages.length) body.images = allImages;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      toast.success("تم إضافة المنتج بنجاح ✅");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/products")} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
          ← رجوع للمنتجات
        </button>
        <h1 className="text-2xl font-bold text-gray-800">إضافة منتج جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* العمود الأيمن - الصور */}
          <div className="lg:col-span-1 flex flex-col gap-5">

            {/* الصورة الأساسية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الأساسية</label>
              <div
                onClick={() => !imagePreview && fileRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center transition-colors h-48 ${!imagePreview ? "cursor-pointer hover:border-blue-400" : ""}`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain rounded-xl" />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                        <span className="text-sm text-blue-600 font-medium">جاري الرفع...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-4xl text-gray-200 mb-2">📷</span>
                    <span className="text-sm text-gray-500">اضغط لاختيار صورة</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageFile} />

              {/* رابط أو رفع + مسح */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={imageLinkInput}
                  onChange={(e) => setImageLinkInput(e.target.value)}
                  placeholder="أو الصق رابط الصورة هنا..."
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMainImageLink())}
                />
                <button type="button" onClick={handleMainImageLink} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                  إضافة
                </button>
              </div>
              {imagePreview && (
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-xs font-medium">
                    تغيير الصورة
                  </button>
                  <button type="button" onClick={clearMainImage} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-xs font-medium">
                    🗑 مسح
                  </button>
                </div>
              )}
              {imageUrl && !uploading && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">✅ تم تحديد الصورة الأساسية</p>
              )}
            </div>

            {/* جاليري الصور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صور الجاليري</label>

              {/* عرض صور الجاليري */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                      <img src={img} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* رفع صورة جاليري */}
              <button
                type="button"
                onClick={() => galleryFileRef.current?.click()}
                disabled={galleryUploading}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
              >
                {galleryUploading ? "جاري الرفع..." : "📁 رفع صورة للجاليري"}
              </button>
              <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFile} />

              {/* رابط صورة جاليري */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={galleryLinkInput}
                  onChange={(e) => setGalleryLinkInput(e.target.value)}
                  placeholder="أو الصق رابط صورة..."
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGalleryLink())}
                />
                <button type="button" onClick={handleGalleryLink} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                  إضافة
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">عدد الصور: {galleryImages.length}</p>
            </div>
          </div>

          {/* العمود الأيسر - البيانات */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="مثال: iPhone 15 Pro Max" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأساسي (ر.س) *</label>
                <input name="originalPrice" type="number" min="0" step="any" value={form.originalPrice} onChange={handleChange} required placeholder="مثال: 5000" className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">السعر الأصلي للمنتج (يُشطب عليه عند وجود خصم)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع بعد الخصم (ر.س)</label>
                <input name="salePrice" type="number" min="0" step="any" value={form.salePrice} onChange={handleChange} placeholder="مثال: 4500" className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">اتركه فارغ لو مفيش خصم - هذا السعر اللي يدفعه العميل</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                  <option value="">-- اختر تصنيف --</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select name="inStock" value={form.inStock} onChange={handleChange} className={inputClass}>
                  <option value="true">متوفر</option>
                  <option value="false">غير متوفر</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="وصف المنتج..." className={`${inputClass} resize-none`} />
            </div>

          </div>
        </div>

        <div className="flex gap-3 pt-5 mt-2 border-t border-gray-100">
          <button type="submit" disabled={saving || uploading || galleryUploading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {saving ? "جاري الحفظ..." : "حفظ المنتج"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="px-8 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
