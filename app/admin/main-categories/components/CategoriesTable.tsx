"use client";
import type { Category } from "../types";

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

interface CategoriesTableProps {
  categories: Category[];
  filtered: Category[];
  paginated: Category[];
  fetching: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (name: string) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CategoriesTable({
  categories,
  filtered,
  paginated,
  fetching,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: CategoriesTableProps) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-gray-100">
        <span className="text-xs sm:text-sm text-gray-500">
          إجمالي التصنيفات: <span className="font-bold text-gray-700">{categories.length}</span>
          {search && <span className="text-xs text-blue-600 mr-2">({filtered.length} مطابق للبحث)</span>}
        </span>
        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن تصنيف..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pl-7"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              title="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
            <tr>
              <th className="px-3 sm:px-4 py-3 w-16">#</th>
              <th className="px-3 sm:px-4 py-3">اسم التصنيف</th>
              <th className="px-3 sm:px-4 py-3 w-32">عدد المنتجات</th>
              <th className="px-3 sm:px-4 py-3 w-28">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                  <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                  <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                  {search ? "لا توجد تصنيفات مطابقة للبحث" : "لا توجد تصنيفات حالياً"}
                </td>
              </tr>
            ) : (
              paginated.map((cat, i) => (
                <tr key={cat.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">
                    {(currentPage - 1) * pageSize + i + 1}
                  </td>
                  <td className="px-3 sm:px-4 py-3 font-medium text-gray-800 text-sm sm:text-base">
                    {cat.name}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cat.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                      {cat.count} منتج
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => onEdit(cat)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="تعديل"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => onDelete(cat.name)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="حذف"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!fetching && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 p-3 border-t border-gray-100 flex-wrap">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ السابق
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 rounded-lg border text-xs sm:text-sm font-medium ${
                p === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            التالي ›
          </button>
        </div>
      )}
    </div>
  );
}
