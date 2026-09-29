"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { compressImage } from "@/app/lib/compressImage";
import { getSubCategoriesCached, invalidateCategoriesCache, SubCat } from "../../_utils/categoriesCache";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Object URL tracking to prevent memory leaks
  const previewUrlRef = useRef<string | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLinkInput, setImageLinkInput] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryLinkInput, setGalleryLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<SubCat[]>([]);
  const [isDragOverMain, setIsDragOverMain] = useState(false);

  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    salePrice: "",
    category: "",
    description: "",
    inStock: "true",
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch(`/api/admin/products/${id}`, { credentials: "include" }).then((r) =>
        r.ok ? r.json() : null
      ),
      getSubCategoriesCached(),
    ]).then(([product, cats]) => {
      if (!isMounted) return;
      if (cats) setCategories(cats);
      if (product) {
        setForm({
          name: product.name || "",
          originalPrice: (product.originalPrice || product.price || "").toString(),
          salePrice: product.salePrice?.toString() || "",
          category: product.category || "",
          description: product.description || "",
          inStock: product.inStock === false ? "false" : "true",
        });

        const mainImg = product.image || product.images?.[0] || "";
        if (mainImg) {
          setImageUrl(mainImg);
          setImagePreview(mainImg);
        }

        // Load gallery images (exclude main image to avoid duplicates)
        if (Array.isArray(product.images) && product.images.length > 0) {
          const gallery = product.images.filter((img: string) => img && img !== mainImg);
          setGalleryImages(gallery);
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Upload image to server with client compression
  async function uploadImage(file: File): Promise<string> {
    const compressed = await compressImage(file);

    const fd = new FormData();
    fd.append("image", compressed);

    const res = await fetch("/api/admin/products/upload-image", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل الرفع");
    return data.url;
  }

  // Handle Main Image file selection
  async function handleMainImageFile(file?: File) {
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const objUrl = URL.createObjectURL(file);
    previewUrlRef.current = objUrl;
    setImagePreview(objUrl);
    setUploading(true);

    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setImageLinkInput("");
      toast.success("تم رفع الصورة بنجاح ✅");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصورة");
      setImagePreview(imageUrl || "");
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleMainImageLink() {
    const link = imageLinkInput.trim();
    if (!link) return;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageUrl(link);
    setImagePreview(link);
    setImageLinkInput("");
    toast.success("تم إضافة رابط الصورة ✅");
  }

  function clearMainImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageUrl("");
    setImagePreview("");
    setImageLinkInput("");
    if (fileRef.current) fileRef.current.value = "";
  }

  // Handle Gallery file selections (supports multiple concurrent files)
  async function handleGalleryFiles(files: FileList | File[]) {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    setGalleryUploading(true);
    try {
      const uploadPromises = validFiles.map((file) => uploadImage(file));
      const results = await Promise.allSettled(uploadPromises);

      const successfulUrls: string[] = [];
      results.forEach((res) => {
        if (res.status === "fulfilled") successfulUrls.push(res.value);
      });

      if (successfulUrls.length > 0) {
        setGalleryImages((prev) => [...prev, ...successfulUrls]);
        toast.success(`تم رفع ${successfulUrls.length} صورة للجاليري بنجاح ✅`);
      }
      if (successfulUrls.length < validFiles.length) {
        toast.error(`فشل رفع ${validFiles.length - successfulUrls.length} صورة`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصور");
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
    const origPrice = Number(form.originalPrice);
    if (!form.name || isNaN(origPrice) || origPrice <= 0) {
      return toast.error("يرجى إدخال اسم وسعر صحيحين للمنتج");
    }

    const salePriceNum = form.salePrice ? Number(form.salePrice) : undefined;
    if (salePriceNum !== undefined && salePriceNum >= origPrice) {
      return toast.error("سعر البيع بعد الخصم يجب أن يكون أقل من السعر الأساسي");
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        originalPrice: origPrice,
        price: salePriceNum || origPrice,
        category: form.category.trim(),
        description: form.description.trim(),
        inStock: form.inStock === "true",
        salePrice: salePriceNum !== undefined ? salePriceNum : "",
      };
      if (imageUrl) body.image = imageUrl;

      const allImages = imageUrl
        ? [imageUrl, ...galleryImages.filter((img) => img !== imageUrl)]
        : [...galleryImages];
      body.images = allImages;

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");

      invalidateCategoriesCache();
      toast.success("تم تعديل المنتج بنجاح ✅");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">جاري تحميل بيانات المنتج...</span>
      </div>
    );
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  const origPriceNum = Number(form.originalPrice);
  const salePriceNum = Number(form.salePrice);
  const hasInvalidSalePrice =
    form.salePrice !== "" &&
    !isNaN(origPriceNum) &&
    !isNaN(salePriceNum) &&
    salePriceNum >= origPriceNum;

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          prefetch={true}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 font-medium transition-colors"
        >
          ← رجوع للمنتجات
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">تعديل المنتج</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* العمود الأيمن - الصور */}
          <div className="lg:col-span-1 flex flex-col gap-5">

            {/* الصورة الأساسية */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الصورة الأساسية
              </label>
              <div
                onClick={() => !imagePreview && fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverMain(true);
                }}
                onDragLeave={() => setIsDragOverMain(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverMain(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleMainImageFile(file);
                }}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all h-52 relative overflow-hidden ${
                  isDragOverMain
                    ? "border-blue-500 bg-blue-50/50"
                    : !imagePreview
                    ? "border-gray-300 hover:border-blue-400 cursor-pointer bg-gray-50/50"
                    : "border-gray-200"
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full p-2 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 rounded-xl">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-blue-600 font-semibold">جاري ضغط ورفع الصورة...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-4xl block mb-2">📷</span>
                    <span className="text-sm font-medium text-gray-600 block">اضغط أو اسحب الصورة هنا</span>
                    <span className="text-xs text-gray-400 mt-1 block">يتم ضغط الصور تلقائياً</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMainImageFile(file);
                }}
              />

              {/* رابط الصورة */}
              <div className="flex gap-2 mt-2.5">
                <input
                  type="text"
                  value={imageLinkInput}
                  onChange={(e) => setImageLinkInput(e.target.value)}
                  placeholder="أو الصق رابط صورة مباشرة..."
                  className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMainImageLink())}
                />
                <button
                  type="button"
                  onClick={handleMainImageLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  إضافة
                </button>
              </div>

              {imagePreview && (
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    تغيير الصورة
                  </button>
                  <button
                    type="button"
                    onClick={clearMainImage}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    مسح
                  </button>
                </div>
              )}
              {imageUrl && !uploading && (
                <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                  ✅ الصورة الأساسية محددة
                </p>
              )}
            </div>

            {/* جاليري الصور */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                صور الجاليري
              </label>

              {/* شبكة الصور */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galleryImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex items-center justify-center"
                    >
                      <img src={img} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="حذف الصورة"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* زر الرفع المتعدد */}
              <button
                type="button"
                onClick={() => galleryFileRef.current?.click()}
                disabled={galleryUploading}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-xs sm:text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {galleryUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    جاري رفع وضغط الصور...
                  </>
                ) : (
                  <>📁 رفع صور للجاليري (يمكنك اختيار عدة صور)</>
                )}
              </button>
              <input
                ref={galleryFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleGalleryFiles(e.target.files)}
              />

              {/* رابط صورة للجاليري */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={galleryLinkInput}
                  onChange={(e) => setGalleryLinkInput(e.target.value)}
                  placeholder="أو الصق رابط صورة..."
                  className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGalleryLink())}
                />
                <button
                  type="button"
                  onClick={handleGalleryLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  إضافة
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">عدد الصور: {galleryImages.length}</p>
            </div>
          </div>

          {/* العمود الأيسر - البيانات */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="مثال: iPhone 16 Pro Max"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأساسي (ر.س) *</label>
                <input
                  name="originalPrice"
                  type="number"
                  min="0"
                  step="any"
                  value={form.originalPrice}
                  onChange={handleChange}
                  required
                  placeholder="مثال: 5000"
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">السعر الأصلي للمنتج</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع بعد الخصم (ر.س)</label>
                <input
                  name="salePrice"
                  type="number"
                  min="0"
                  step="any"
                  value={form.salePrice}
                  onChange={handleChange}
                  placeholder="مثال: 4500"
                  className={`${inputClass} ${hasInvalidSalePrice ? "border-amber-400 focus:ring-amber-400" : ""}`}
                />
                {hasInvalidSalePrice ? (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    ⚠️ سعر البيع يجب أن يكون أقل من السعر الأساسي
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">اتركه فارغاً إذا لم يوجد خصم</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                  <option value="">-- اختر تصنيف --</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة المخزون</label>
                <select name="inStock" value={form.inStock} onChange={handleChange} className={inputClass}>
                  <option value="true">متوفر في المخزون</option>
                  <option value="false">نفذت الكمية (غير متوفر)</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="تفاصيل ووصف المنتج..."
                className={`${inputClass} resize-none`}
              />
            </div>

          </div>
        </div>

        <div className="flex gap-3 pt-5 mt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving || uploading || galleryUploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <Link
            href="/admin/products"
            className="px-8 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors text-center"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
