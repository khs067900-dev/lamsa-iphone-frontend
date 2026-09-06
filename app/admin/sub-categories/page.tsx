"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type SubCat = { name: string; category: string; count: number };
type Settings = { category: string; subCategory: string; showInHome: boolean; order: number };

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export default function SubCategoriesPage() {
  const [items, setItems] = useState<SubCat[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<SubCat | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const allSubCategories = [...new Set(items.map((i) => i.name).filter(Boolean))];
  const [confirmDelete, setConfirmDelete] = useState<SubCat | null>(null);
  const [max, setMax] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  function getSetting(cat: SubCat): Settings | undefined {
    return settings.find((s) => s.category === cat.category && s.subCategory === cat.name);
  }

  async function fetchData() {
    const [res1, res2, res3, res4] = await Promise.all([
      apiFetch("/api/admin/sub-categories", { credentials: "include" }),
      apiFetch("/api/admin/sub-categories/settings", { credentials: "include" }),
      apiFetch("/api/admin/sub-categories/max", { credentials: "include" }),
      apiFetch("/api/admin/sub-categories/extra", { credentials: "include" }),
    ]);
    const fromProducts: SubCat[] = res1.ok ? await res1.json() : [];
    const extra: SubCat[] = res4.ok ? await res4.json() : [];
    const names = new Set(fromProducts.map((c) => c.name));
    setItems([...fromProducts, ...extra.filter((c) => !names.has(c.name))]);
    if (res2.ok) setSettings(await res2.json());
    if (res3.ok) { const d = await res3.json(); setMax(d?.max ?? 4); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    const res = await apiFetch("/api/admin/sub-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: addName }),
    });
    setAddLoading(false);
    if (!res.ok) { const d = await res.json(); return toast.error(d.error); }
    toast.success(`تم إضافة "${addName}" بنجاح 🎉`);
    setShowAddModal(false);
    setAddName("");
    fetchData();
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []);

  const visibleCount = settings.filter((s) => s.showInHome && s.category !== "__config__").length;

  async function handleToggleHome(cat: SubCat) {
    const setting = getSetting(cat);
    if (!setting?.showInHome && visibleCount >= max) {
      return toast.error(`الحد الأقصى ${max} تصنيفات في الرئيسية`);
    }
    const res = await apiFetch("/api/admin/sub-categories/settings/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category: cat.category, subCategory: cat.name }),
    });
    if (!res.ok) return toast.error("حدث خطأ");
    const { showInHome } = await res.json();
    setSettings((prev) => {
      const exists = prev.find((s) => s.category === cat.category && s.subCategory === cat.name);
      if (exists) return prev.map((s) => s.category === cat.category && s.subCategory === cat.name ? { ...s, showInHome } : s);
      return [...prev, { category: cat.category, subCategory: cat.name, showInHome, order: 0 }];
    });
    toast.success(showInHome ? "سيظهر في الرئيسية ✅" : "تم الإخفاء من الرئيسية");
  }

  async function handleOrderChange(cat: SubCat, order: number) {
    await apiFetch("/api/admin/sub-categories/settings/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category: cat.category, subCategory: cat.name, order }),
    });
    setSettings((prev) => {
      const exists = prev.find((s) => s.category === cat.category && s.subCategory === cat.name);
      if (exists) return prev.map((s) => s.category === cat.category && s.subCategory === cat.name ? { ...s, order } : s);
      return [...prev, { category: cat.category, subCategory: cat.name, showInHome: false, order }];
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setEditLoading(true);
    const res = await apiFetch("/api/admin/sub-categories/rename", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ oldName: editItem.name, oldCategory: editItem.category, newName: editName, newCategory: editCategory }),
    });
    setEditLoading(false);
    if (!res.ok) return toast.error("حدث خطأ أثناء التعديل");
    toast.success("تم التعديل بنجاح ✅");
    setEditItem(null);
    fetchData();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    const res = await apiFetch("/api/admin/sub-categories/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: confirmDelete.name }),
    });
    if (!res.ok) return toast.error("حدث خطأ أثناء الحذف");
    toast.success(`تم حذف "${confirmDelete.name}" بنجاح ✅`);
    setConfirmDelete(null);
    fetchData();
  }

  const filtered = items.filter((c) => c.name.includes(search) || c.category?.includes(search));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">التصنيفات الفرعية</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <span className="text-lg leading-none">+</span> إضافة تصنيف فرعي
        </button>
      </div>

      <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm mb-4">
        <span className="shrink-0">⚠️</span>
        <span>لعرض منتجات تصنيف فرعي في الصفحة الرئيسية، فعّل خيار <span className="font-bold">&quot;عرض في الرئيسية&quot;</span> بجانبه، ثم حدد <span className="font-bold">الترتيب</span> الذي تريده — الرقم الأصغر يظهر أولاً. الحد الأقصى {max} تصنيفات — لزيادة العدد اذهب لـ <Link href="/admin/category-items" className="font-bold underline hover:text-amber-800">إعدادات التصنيفات</Link>.</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-500">
              إجمالي التصنيفات: <span className="font-bold text-gray-700">{items.length}</span>
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visibleCount >= max ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
              الرئيسية: {visibleCount}/{max}
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="ابحث عن تصنيف..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 md:w-52"
          />
        </div>
        <div className="overflow-x-auto scrollbar-visible">
          <table className="w-full text-sm text-right min-w-[650px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
              <tr>
                <th className="px-2 sm:px-4 py-3">#</th>
                <th className="px-2 sm:px-4 py-3">الاسم</th>
                <th className="px-2 sm:px-4 py-3">النوع</th>
                <th className="px-2 sm:px-4 py-3">عدد المنتجات</th>
                <th className="px-2 sm:px-4 py-3 text-center">عرض في الرئيسية</th>
                <th className="px-2 sm:px-4 py-3 text-center">الترتيب</th>
                <th className="px-2 sm:px-4 py-3">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((cat, i) => {
                const setting = getSetting(cat);
                return (
                  <tr key={`${cat.category}-${cat.name}`} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-2 sm:px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm md:text-base">{cat.category}</td>
                    <td className="px-2 sm:px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm md:text-base">{cat.name}</td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cat.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {cat.count} منتج
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={setting?.showInHome ?? false}
                        onChange={() => handleToggleHome(cat)}
                        disabled={!setting?.showInHome && visibleCount >= max}
                        className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-center">
                      <input
                        type="number"
                        min={0}
                        defaultValue={setting?.order ?? 0}
                        onBlur={(e) => handleOrderChange(cat, parseInt(e.target.value) || 0)}
                        disabled={!setting?.showInHome}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => { setEditItem(cat); setEditName(cat.name); setEditCategory(cat.category); }}
                          className="text-blue-500 hover:text-blue-700" title="تعديل"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(cat)}
                          className="text-red-500 hover:text-red-700" title="حذف"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">لا توجد تصنيفات فرعية</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ السابق
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            التالي ›
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">إضافة تصنيف فرعي جديد</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">اسم التصنيف الفرعي</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: آيفون"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={addLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
                  {addLoading ? "جاري الإضافة..." : "إضافة"}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setAddName(""); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">تعديل: {editItem.name}</h2>
            {editItem.count > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                ⚠️ سيتم تغيير التصنيف في <span className="font-bold">{editItem.count} منتج</span>
              </p>
            )}
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">الاسم (التصنيف الرئيسي)</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">النوع (التصنيف الفرعي)</label>
                <select
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {allSubCategories.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={editLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
                  {editLoading ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button type="button" onClick={() => setEditItem(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-sm text-center">
            <div className="text-3xl sm:text-4xl mb-3">🗑️</div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-1">هتحذف التصنيف</p>
            <p className="text-sm sm:text-base font-bold text-red-600 mb-2">« {confirmDelete.name} »</p>
            <p className="text-xs text-gray-400 mb-4">سيتم إزالة هذا التصنيف من جميع المنتجات المرتبطة به</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2 rounded-lg transition-colors">
                نعم، احذف
              </button>
              <button onClick={() => setConfirmDelete(null)}
                className="border border-gray-300 text-gray-700 text-xs sm:text-sm font-bold px-5 sm:px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
