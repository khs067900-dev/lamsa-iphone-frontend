"use client";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getSubCategoriesCached, SubCat } from "./_utils/categoriesCache";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
  _id: string;
  name: string;
  category: string;
  originalPrice: number;
  salePrice?: number;
  inStock?: boolean;
  image?: string;
};

type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  pages: number;
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ─── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

// ─── Memoized Product Row Component ────────────────────────────────────────────
// Prevents all rows from re-rendering on every keystroke in search
interface ProductRowProps {
  product: Product;
  rowNum: number;
  isDeleting: boolean;
  onConfirmDelete: (product: { id: string; name: string }) => void;
  onToggleStock: (id: string, currentStock: boolean) => void;
  isTogglingStock: boolean;
}

const ProductTableRow = React.memo(function ProductTableRow({
  product,
  rowNum,
  isDeleting,
  onConfirmDelete,
  onToggleStock,
  isTogglingStock,
}: ProductRowProps) {
  const mainPrice = product.originalPrice ?? 0;
  const sale =
    product.salePrice && product.salePrice > 0 && product.salePrice < mainPrice
      ? product.salePrice
      : null;
  const inStock = product.inStock !== false;

  return (
    <tr
      className={`text-base transition-colors ${
        isDeleting ? "opacity-35 pointer-events-none" : "hover:bg-gray-50/80"
      }`}
    >
      <td className="px-5 py-3 text-gray-400 font-medium">{rowNum}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-gray-400 text-xs">📦</span>
            )}
          </div>
          <span className="font-semibold text-gray-800 line-clamp-1">{product.name}</span>
        </div>
      </td>
      <td className="px-5 py-3 text-gray-600 text-sm">
        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
          {product.category || "—"}
        </span>
      </td>
      <td className="px-5 py-3 text-gray-700">
        {sale ? (
          <div>
            <span className="text-green-600 font-bold text-sm">{sale} ر.س</span>
            <span className="text-gray-400 line-through text-xs mr-1.5">{mainPrice}</span>
          </div>
        ) : (
          <span className="font-medium text-sm">{mainPrice} ر.س</span>
        )}
      </td>
      <td className="px-5 py-3">
        {/* Fast inStock toggle */}
        <button
          onClick={() => onToggleStock(product._id, inStock)}
          disabled={isTogglingStock || isDeleting}
          title={inStock ? "اضغط لتعيين كغير متوفر" : "اضغط لتعيين كمتوفر"}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
            inStock
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
          } ${isTogglingStock ? "opacity-50 cursor-wait" : ""}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              inStock ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {inStock ? "متوفر" : "نفذت"}
        </button>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/products/${product._id}/edit`}
            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
            title="تعديل المنتج"
            aria-label="تعديل المنتج"
          >
            <EditIcon />
          </Link>
          <button
            onClick={() => !isDeleting && onConfirmDelete({ id: product._id, name: product.name })}
            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-40"
            title="حذف المنتج"
            aria-label="حذف المنتج"
            disabled={isDeleting}
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────────
function ProductsContent() {
  // Server-driven state
  const [products, setProducts]         = useState<Product[]>([]);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [currentPage, setCurrentPage]   = useState(1);
  const [loading, setLoading]           = useState(true);

  // Filter state
  const [selectedCat, setSelectedCat]   = useState<string>("");
  const [search, setSearch]             = useState("");
  const [committedSearch, setCommittedSearch] = useState("");

  // Categories (fetched once with shared client cache)
  const [subCategories, setSubCategories] = useState<SubCat[]>([]);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [togglingId, setTogglingId]       = useState<string | null>(null);

  // AbortController ref — cancel in-flight fetch on new request
  const abortRef = useRef<AbortController | null>(null);
  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch products from server (with real pagination + search + filter) ──────
  const fetchProducts = useCallback(
    async (page: number, q: string, cat: string, signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (q)   params.set("q",        q);
        if (cat) params.set("category", cat);

        const res = await fetch(`/api/admin/products?${params.toString()}`, {
          credentials: "include",
          signal,
        });

        if (!res.ok) throw new Error("فشل تحميل المنتجات");
        const data: ProductsResponse = await res.json();

        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.pages ?? 0);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        toast.error("فشل تحميل المنتجات");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Fetch categories once on mount with client cache ─────────────────────────
  useEffect(() => {
    getSubCategoriesCached().then((data) => setSubCategories(data));
  }, []);

  // ── Trigger fetch whenever page / committedSearch / selectedCat changes ─────
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    fetchProducts(currentPage, committedSearch, selectedCat, ac.signal);

    return () => ac.abort();
  }, [currentPage, committedSearch, selectedCat, fetchProducts]);

  // ── Debounce search input → commit search and reset page together ───────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCommittedSearch(val);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ── Category selection (toggleable) ──────────────────────────────────────────
  const selectCategory = useCallback((cat: string) => {
    setSelectedCat((prev) => (prev === cat ? "" : cat));
    setCurrentPage(1);
  }, []);

  // ── Fast In-Stock Toggle ─────────────────────────────────────────────────────
  const handleToggleStock = useCallback(async (id: string, currentStock: boolean) => {
    setTogglingId(id);
    const newStock = !currentStock;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, inStock: newStock } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("فشل تعديل الحالة");
      }
      toast.success(newStock ? "المنتج متوفر الآن ✅" : "تم تعيين المنتج كغير متوفر ⚠️");
    } catch {
      // Rollback on failure
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, inStock: currentStock } : p))
      );
      toast.error("فشل تغيير حالة المنتج");
    } finally {
      setTogglingId(null);
    }
  }, []);

  // ── Confirm Delete Action ────────────────────────────────────────────────────
  const onConfirmDelete = useCallback((target: { id: string; name: string }) => {
    setConfirmDelete(target);
  }, []);

  async function confirmDeleteAction() {
    if (!confirmDelete || deletingId) return;
    const { id, name } = confirmDelete;
    setConfirmDelete(null);
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        toast.error(data.message || "فشل الحذف");
        return;
      }

      toast.success(`تم حذف "${name}" بنجاح ✅`);

      // Targeted local update
      setProducts((prev) => {
        const next = prev.filter((p) => p._id !== id);
        // If current page became empty and it's not page 1, go back
        if (next.length === 0 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        }
        return next;
      });
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      toast.error("فشل الحذف");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Pagination helper ────────────────────────────────────────────────────────
  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الأصناف والمنتجات</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            إدارة وتعديل المنتجات والمخزون والأسعار
          </p>
        </div>
        <Link
          href="/admin/products/new"
          prefetch={true}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          إضافة منتج جديد
        </Link>
      </div>

      {/* Category filter chips */}
      {subCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 items-center">
          <button
            onClick={() => selectCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
              selectedCat === ""
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            الكل
          </button>
          {subCategories.map((cat) => {
            const isSelected = selectedCat === cat.name;
            return (
              <button
                key={`${cat.category}-${cat.name}`}
                onClick={() => selectCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cat.name}
                <span className="mr-1 text-xs opacity-70">({cat.count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>إجمالي المنتجات:</span>
            <span className="font-bold text-gray-800 bg-gray-200/70 px-2 py-0.5 rounded-md text-xs">
              {loading ? "..." : total}
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="ابحث بالاسم، الماركة..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-8"
            />
            <span className="absolute right-2.5 top-2.5 text-gray-400 text-sm pointer-events-none">
              🔍
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm text-right">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-sm border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 w-12">#</th>
                <th className="px-5 py-3 min-w-[220px]">المنتج</th>
                <th className="px-5 py-3 min-w-[130px]">التصنيف</th>
                <th className="px-5 py-3 min-w-[130px]">السعر</th>
                <th className="px-5 py-3 min-w-[110px]">المخزون</th>
                <th className="px-5 py-3 min-w-[100px]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton rows while loading
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                        <div className="h-4 bg-gray-100 rounded w-44" />
                      </div>
                    </td>
                    <td className="px-5 py-3"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-5 py-3"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-5 py-3"><div className="h-4 bg-gray-100 rounded w-14" /></td>
                    <td className="px-5 py-3"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <div className="text-3xl mb-2">🔍</div>
                    لا توجد منتجات مطابقة للبحث أو التصنيف
                  </td>
                </tr>
              ) : (
                products.map((p, i) => {
                  const rowNum = (currentPage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <ProductTableRow
                      key={p._id}
                      product={p}
                      rowNum={rowNum}
                      isDeleting={deletingId === p._id}
                      onConfirmDelete={onConfirmDelete}
                      onToggleStock={handleToggleStock}
                      isTogglingStock={togglingId === p._id}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5 flex-wrap">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            السابق
          </button>
          {(() => {
            const pages: (number | string)[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (currentPage > 3) pages.push("...");
              for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
              if (currentPage < totalPages - 2) pages.push("...");
              pages.push(totalPages);
            }
            return pages.map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            );
          })()}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            التالي
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4"
          dir="rtl"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">تأكيد حذف المنتج</h2>
            <p className="text-sm text-gray-500 mb-1">هل أنت متأكد من حذف المنتج بشكل نهائي؟</p>
            <p className="text-base font-bold text-red-600 mb-4 bg-red-50 py-1 px-2 rounded-md">
              « {confirmDelete.name} »
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmDeleteAction}
                disabled={!!deletingId}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {deletingId ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="border border-gray-300 text-gray-700 text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">جاري التحميل...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
