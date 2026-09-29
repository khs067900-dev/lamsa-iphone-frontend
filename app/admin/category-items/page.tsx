"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type SubCat = { name: string; category: string; count: number };
type Settings = { category: string; subCategory: string; showInHome: boolean; order: number };
type CatImage = { name: string; image: string; count?: number };

export default function CategoryItemsPage() {
  const [items, setItems] = useState<SubCat[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [max, setMax] = useState(4);
  const [maxInput, setMaxInput] = useState(4);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // image upload state
  const [categories, setCategories] = useState<CatImage[]>([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs
  const clearPreview = useCallback(() => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview("");
  }, [preview]);

  // [PERF] High-speed single bundle request with fallback
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await apiFetch("/api/admin/sub-categories/bundle", { credentials: "include" });
        if (res.ok) {
          const bundle = await res.json();
          if (isMounted) {
            setItems(bundle.items || []);
            setSettings(bundle.settings || []);
            const m = bundle.max ?? 4;
            setMax(m);
            setMaxInput(m);
            setCategories(bundle.publicCategories || []);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Bundle endpoint fallback in category-items:", err);
      }

      // Fallback
      try {
        const [subs, sets, maxData, cats] = await Promise.all([
          apiFetch("/api/admin/sub-categories", { credentials: "include" }).then((r) => r.json()),
          apiFetch("/api/admin/sub-categories/settings", { credentials: "include" }).then((r) => r.json()),
          apiFetch("/api/admin/sub-categories/max", { credentials: "include" }).then((r) => r.json()),
          apiFetch("/api/admin/sub-categories/public").then((r) => r.json()),
        ]);
        if (isMounted) {
          setItems(Array.isArray(subs) ? subs : []);
          setSettings(Array.isArray(sets) ? sets : []);
          const m = maxData?.max ?? 4;
          setMax(m);
          setMaxInput(m);
          setCategories(Array.isArray(cats) ? cats : []);
          setLoading(false);
        }
      } catch (err) {
        console.error("loadData error:", err);
        if (isMounted) {
          toast.error("فشل تحميل البيانات");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSaveMax() {
    if (maxInput < 1) return toast.error("الحد الأدنى 1");
    if (maxInput > 50) return toast.error("الحد الأقصى المسموح به 50");
    setSaving(true);
    try {
      const res = await apiFetch("/api/admin/sub-categories/max", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ max: maxInput }),
      });
      if (!res.ok) throw new Error("Failed to save max");
      setMax(maxInput);
      toast.success(`تم تحديث الحد إلى ${maxInput} ✅`);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ الحد الأقصى");
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setHasFile(!!file);
    clearPreview();
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  const handleCatChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCat(e.target.value);
      clearPreview();
      setHasFile(false);
      if (fileRef.current) fileRef.current.value = "";
    },
    [clearPreview]
  );

  async function handleUploadImage() {
    if (!selectedCat) return toast.error("اختر تصنيفاً أولاً");
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("اختر صورة أولاً");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("category", selectedCat);
      fd.append("image", file);
      const res = await apiFetch("/api/admin/sub-categories/settings/image", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        throw new Error("Upload failed");
      }
      const { url } = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.name === selectedCat ? { ...c, image: url } : c))
      );
      clearPreview();
      setHasFile(false);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("تم رفع الصورة بنجاح ✅");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  const currentImage = useMemo(
    () => categories.find((c) => c.name === selectedCat)?.image ?? "",
    [categories, selectedCat]
  );

  // [PERF] O(1) count lookup map
  const countMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of items) {
      m.set(`${item.category}::${item.name}`, item.count);
      if (!m.has(item.category)) m.set(item.category, item.count);
      if (!m.has(item.name)) m.set(item.name, item.count);
    }
    return m;
  }, [items]);

  // [PERF] Memoize visible list with O(1) counts
  const visible = useMemo(
    () =>
      settings
        .filter((s) => s.showInHome && s.category !== "__config__")
        .sort((a, b) => a.order - b.order)
        .map((s) => {
          const count =
            countMap.get(`${s.category}::${s.subCategory}`) ??
            countMap.get(s.category) ??
            countMap.get(s.subCategory) ??
            0;
          return { ...s, count };
        }),
    [settings, countMap]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">التصنيفات في الرئيسية</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visible.length >= max ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
          {visible.length}/{max}
        </span>
      </div>

      {/* Max control */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">الحد الأقصى للتصنيفات في الرئيسية:</span>
        <input
          type="number"
          min={1}
          max={50}
          value={maxInput}
          onChange={(e) => setMaxInput(parseInt(e.target.value) || 1)}
          className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSaveMax}
          disabled={saving || maxInput === max}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
        {visible.length > maxInput && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            ⚠️ يوجد {visible.length} تصنيف مختار، سيظهر أول {maxInput} فقط
          </span>
        )}
      </div>

      {/* Category image upload */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">صورة التصنيف في قسم &quot;تسوق حسب الأقسام&quot;</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">اختر التصنيف</label>
            <select
              value={selectedCat}
              onChange={handleCatChange}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            >
              <option value="">-- اختر --</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedCat && (
            <>
              {(preview || currentImage) && (
                <img
                  src={preview || currentImage}
                  alt="معاينة الصورة"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">ارفع صورة جديدة</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleUploadImage}
                disabled={uploading || !hasFile}
                className="bg-teal-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? "جاري الرفع..." : "رفع الصورة"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[500px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
              <tr>
                <th className="px-4 py-3 w-20">الترتيب</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3 w-32">عدد المنتجات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">لا توجد تصنيفات معروضة في الرئيسية</td></tr>
              ) : (
                visible.map((s, i) => (
                  <tr key={`${s.category}-${s.subCategory}`} className={`hover:bg-gray-50 transition-colors ${i >= max ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">
                      {i + 1}
                      {i >= max && <span className="mr-1 text-xs text-red-500 font-normal">(مخفي)</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm">{s.category}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm">{s.subCategory}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${s.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.count} منتج
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
