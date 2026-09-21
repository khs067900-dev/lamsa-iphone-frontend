"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Image as ImageIcon, Plus } from "lucide-react";
import BannerCard, { type BannerItem } from "../_components/BannerCard";

// ─── Hook ────────────────────────────────────────────────────────────────────

function useCategoryBanners(category: string) {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const BASE = `/api/admin/category-banners/${encodeURIComponent(category)}`;

  useEffect(() => {
    if (!category) return;
    setBanners([]);
    fetch(BASE, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setBanners(d))
      .catch(() => {});
  }, [category, BASE]);

  const handleUpload = async (index: number, file: File) => {
    setLoading(index);
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await fetch(`${BASE}/upload/${index}`, { method: "POST", credentials: "include", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: data.url } : b));
      toast.success("تم رفع البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally { setLoading(null); }
  };

  const handleToggle = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/toggle/${index}`, { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, active: data.active } : b));
      toast.success(data.active ? "تم تفعيل البانر" : "تم إيقاف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل التعديل");
    } finally { setLoading(null); }
  };

  const handleDeleteImage = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}/image`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("فشل الحذف");
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: "" } : b));
      toast.success("تم حذف الصورة");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally { setLoading(null); }
  };

  const handleDeleteSlot = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("فشل الحذف");
      setBanners((prev) => prev.filter((_, i) => i !== index));
      toast.success("تم حذف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally { setLoading(null); }
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      const res = await fetch(`${BASE}/add`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners((prev) => [...prev, { url: "", active: true }]);
      toast.success("تمت إضافة بانر جديد");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشلت الإضافة");
    } finally { setAdding(false); }
  };

  return { banners, loading, adding, inputRefs, handleUpload, handleToggle, handleDeleteImage, handleDeleteSlot, handleAdd };
}

// ─── Panel ───────────────────────────────────────────────────────────────────

function CategoryBannersPanel({ category }: { category: string }) {
  const { banners, loading, adding, inputRefs, handleUpload, handleToggle, handleDeleteImage, handleDeleteSlot, handleAdd } =
    useCategoryBanners(category);

  const filled = banners.filter((b) => b.url).length;
  const activeCount = banners.filter((b) => b.url && b.active).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2">
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-600">{activeCount}</div>
            <div className="text-xs text-indigo-400">مفعّل</div>
          </div>
          <div className="w-px h-6 bg-indigo-200" />
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">{filled - activeCount}</div>
            <div className="text-xs text-gray-400">موقوف</div>
          </div>
          <div className="w-px h-6 bg-indigo-200" />
          <div className="text-center">
            <div className="text-lg font-bold text-gray-300">{banners.length - filled}</div>
            <div className="text-xs text-gray-300">فارغ</div>
          </div>
        </div>
        {banners.length < 10 && (
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 text-sm whitespace-nowrap"
          >
            <Plus size={16} />
            {adding ? "جاري الإضافة..." : "إضافة بانر"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {banners.map((banner, i) => (
          <BannerCard
            key={i}
            banner={banner}
            index={i}
            isLoading={loading === i}
            inputRef={(el) => { inputRefs.current[i] = el; }}
            onUpload={handleUpload}
            onToggle={handleToggle}
            onDeleteImage={handleDeleteImage}
            onDeleteSlot={handleDeleteSlot}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CategoryBannersPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    fetch("/api/admin/sub-categories", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { category: string }[]) => {
        if (!Array.isArray(data)) return;
        const unique = [...new Set(data.map((d) => d.category).filter(Boolean))];
        setCategories(unique);
        if (unique.length) setSelected(unique[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -mx-3 -mt-0 sm:-mx-5 md:-mx-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-3 mb-1">
          <ImageIcon size={22} className="text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">بانرات التصنيفات</h1>
        </div>
        <p className="text-gray-500 text-sm">ارفع وعدّل صور البانرات التي تظهر في صفحة كل تصنيف</p>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs mb-4">
          <span className="shrink-0">⚠️</span>
          <span>اختر التصنيف من الأزرار بالأسفل ثم ارفع صور البانرات — يمكنك تفعيل أو إيقاف أو حذف كل بانر على حدة. البانرات المفعّلة فقط هي التي تظهر للعملاء في صفحة التصنيف.</span>
        </div>

        {categories.length === 0 ? (
          <div className="text-center text-gray-400 py-16">جاري تحميل التصنيفات...</div>
        ) : (
          <>
            {/* Category tabs */}
            <div
              className="cat-scroll flex gap-2 mb-6 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#a5b4fc #e0e7ff" }}
            >
              <style>{`
                .cat-scroll::-webkit-scrollbar { height: 6px; }
                .cat-scroll::-webkit-scrollbar-track { background: #e0e7ff; border-radius: 3px; }
                .cat-scroll::-webkit-scrollbar-thumb { background: #a5b4fc; border-radius: 3px; }
              `}</style>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelected(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition border whitespace-nowrap shrink-0 ${
                    selected === cat
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Panel — keyed so it remounts (and re-fetches) on category change */}
            {selected && <CategoryBannersPanel key={selected} category={selected} />}
          </>
        )}
      </div>
    </div>
  );
}
