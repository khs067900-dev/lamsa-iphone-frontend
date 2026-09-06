"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Image as ImageIcon, Plus } from "lucide-react";

type BannerItem = { url: string; active: boolean };

const LABELS = [
  "البانر الأول", "البانر الثاني", "البانر الثالث", "البانر الرابع",
  "البانر الخامس", "البانر السادس", "البانر السابع", "البانر الثامن",
  "البانر التاسع", "البانر العاشر",
];

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
      .then((d) => Array.isArray(d) && setBanners(d));
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

function BannerCard({
  banner, index, isLoading, inputRef, onUpload, onToggle, onDeleteImage, onDeleteSlot,
}: {
  banner: BannerItem; index: number; isLoading: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onUpload: (i: number, f: File) => void;
  onToggle: (i: number) => void;
  onDeleteImage: (i: number) => void;
  onDeleteSlot: (i: number) => void;
}) {
  const hasImage = !!banner.url;
  const localRef = useRef<HTMLInputElement | null>(null);
  const triggerInput = () => { if (!isLoading) localRef.current?.click(); };

  return (
    <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-lg ${!banner.active && hasImage ? "opacity-60" : ""} ${hasImage ? "border-indigo-100" : "border-gray-100"}`}>
      <div className="absolute top-3 right-3 z-10">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${hasImage && banner.active ? "bg-emerald-500 text-white" : hasImage ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-400"}`}>
          {hasImage && banner.active ? "✓ مفعّل" : hasImage ? "⏸ موقوف" : "فارغ"}
        </span>
      </div>
      <div className={`relative w-full aspect-[2.5/1] cursor-pointer overflow-hidden ${hasImage ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"}`} onClick={triggerInput}>
        {hasImage ? (
          <>
            <Image src={banner.url} alt={LABELS[index] || `بانر ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90" unoptimized />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl shadow">🖼 تغيير الصورة</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 group-hover:bg-indigo-50 transition-colors duration-300">
            <div className="w-10 h-10 rounded-2xl bg-gray-200 group-hover:bg-indigo-100 flex items-center justify-center transition-colors duration-300">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm text-gray-400 group-hover:text-indigo-500 font-medium transition-colors">اضغط لرفع صورة</span>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-indigo-600 font-medium">جاري التحميل...</span>
            </div>
          </div>
        )}
      </div>
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 shrink-0 rounded-full ${hasImage && banner.active ? "bg-emerald-400" : hasImage ? "bg-orange-400" : "bg-gray-300"}`} />
          <span className="font-semibold text-gray-700 text-sm truncate">{LABELS[index] || `بانر ${index + 1}`}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={(el) => { localRef.current = el; inputRef(el); }}
            type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(index, e.target.files[0])}
          />
          <button onClick={triggerInput} disabled={isLoading} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-40 whitespace-nowrap">
            {hasImage ? "تغيير" : "رفع"}
          </button>
          {hasImage && (
            <>
              <button onClick={() => onToggle(index)} disabled={isLoading} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-40 whitespace-nowrap ${banner.active ? "bg-orange-50 hover:bg-orange-100 text-orange-500" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"}`}>
                {banner.active ? "إيقاف" : "تفعيل"}
              </button>
              <button onClick={() => onDeleteImage(index)} disabled={isLoading} title="حذف الصورة" className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition disabled:opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </>
          )}
          <button onClick={() => onDeleteSlot(index)} disabled={isLoading} title="حذف البانر بالكامل" className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition disabled:opacity-40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryBannersPanel({ category }: { category: string }) {
  const { banners, loading, adding, inputRefs, handleUpload, handleToggle, handleDeleteImage, handleDeleteSlot, handleAdd } = useCategoryBanners(category);
  const filled = banners.filter((b) => b.url).length;
  const activeCount = banners.filter((b) => b.url && b.active).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2">
          <div className="text-center"><div className="text-lg font-bold text-indigo-600">{activeCount}</div><div className="text-xs text-indigo-400">مفعّل</div></div>
          <div className="w-px h-6 bg-indigo-200" />
          <div className="text-center"><div className="text-lg font-bold text-gray-400">{filled - activeCount}</div><div className="text-xs text-gray-400">موقوف</div></div>
          <div className="w-px h-6 bg-indigo-200" />
          <div className="text-center"><div className="text-lg font-bold text-gray-300">{banners.length - filled}</div><div className="text-xs text-gray-300">فارغ</div></div>
        </div>
        {banners.length < 10 && (
          <button onClick={handleAdd} disabled={adding} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 text-sm whitespace-nowrap">
            <Plus size={16} />
            {adding ? "جاري الإضافة..." : "إضافة بانر"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {banners.map((banner, i) => (
          <BannerCard
            key={i} banner={banner} index={i} isLoading={loading === i}
            inputRef={(el) => { inputRefs.current[i] = el; }}
            onUpload={handleUpload} onToggle={handleToggle}
            onDeleteImage={handleDeleteImage} onDeleteSlot={handleDeleteSlot}
          />
        ))}
      </div>
    </div>
  );
}

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
            <div className="cat-scroll flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a5b4fc #e0e7ff' }}>
              <style>{`
                .cat-scroll::-webkit-scrollbar { height: 6px; }
                .cat-scroll::-webkit-scrollbar-track { background: #e0e7ff; border-radius: 3px; }
                .cat-scroll::-webkit-scrollbar-thumb { background: #a5b4fc; border-radius: 3px; }
              `}</style>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelected(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition border whitespace-nowrap shrink-0 ${selected === cat ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {selected && <CategoryBannersPanel key={selected} category={selected} />}
          </>
        )}
      </div>
    </div>
  );
}
