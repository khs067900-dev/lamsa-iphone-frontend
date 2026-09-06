"use client";
import { useState, useEffect, useCallback } from "react";

interface BlockedDevice {
  _id: string;
  fingerprint: string | null;
  ip: string | null;
  userAgent: string | null;
  reason: string;
  blockedBy: string;
  isActive: boolean;
  createdAt: string;
}

export default function BlockedTable({ onUnblockSuccess }: { onUnblockSuccess?: () => void }) {
  const [devices, setDevices] = useState<BlockedDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const fetchBlocked = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/secret/devices?type=blocked&page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setDevices(data.devices || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchBlocked(); }, [fetchBlocked]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleUnblock(id: string) {
    if (!confirm("رفع الحظر عن هذا الجهاز؟")) return;
    const res = await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unblock", id }),
    });
    const data = await res.json();
    if (data.success) {
      showToast("تم رفع الحظر ✓");
      fetchBlocked();
      onUnblockSuccess?.();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف سجل الحظر نهائياً؟")) return;
    await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-blocked", id }),
    });
    showToast("تم الحذف ✓");
    fetchBlocked();
  }

  async function handleUnblockAll() {
    if (!confirm("رفع الحظر عن جميع الأجهزة؟")) return;
    const res = await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unblock-all" }),
    });
    const data = await res.json();
    if (data.success) {
      showToast("تم رفع الحظر عن الكل ✓");
      fetchBlocked();
      onUnblockSuccess?.();
    }
  }

  async function handleDeleteAll() {
    if (!confirm("حذف جميع سجلات الحظر نهائياً؟")) return;
    await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-all-blocked" }),
    });
    showToast("تم حذف الكل ✓");
    fetchBlocked();
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl">
          {toast}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
          placeholder="بحث بـ IP أو Fingerprint..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 placeholder-gray-600"
        />
        <button
          onClick={() => { setSearch(searchInput); setPage(1); }}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          بحث
        </button>
      </div>

      <p className="text-gray-500 text-xs mb-3">إجمالي: {total} جهاز محظور</p>

      {total > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleUnblockAll}
            className="bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
          >
            رفع الحظر عن الكل
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
          >
            حذف الكل
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500">جاري التحميل...</div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 text-gray-600">لا توجد أجهزة محظورة</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/60 text-gray-400 text-xs">
                <th className="px-4 py-3 text-right font-medium">#</th>
                <th className="px-4 py-3 text-right font-medium">IP</th>
                <th className="px-4 py-3 text-right font-medium">Fingerprint</th>
                <th className="px-4 py-3 text-right font-medium">السبب</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">تاريخ الحظر</th>
                <th className="px-4 py-3 text-right font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {devices.map((d) => (
                <tr key={d._id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs">{(page - 1) * 20 + devices.indexOf(d) + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{d.ip || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate" title={d.fingerprint || ""}>
                    {d.fingerprint ? d.fingerprint.slice(0, 12) + "..." : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate" title={d.reason}>{d.reason}</td>
                  <td className="px-4 py-3">
                    {d.isActive ? (
                      <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded-lg">محظور</span>
                    ) : (
                      <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-lg">مرفوع</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(d.createdAt).toLocaleString("ar-SA")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {d.isActive && (
                        <button
                          onClick={() => handleUnblock(d._id)}
                          className="bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          رفع الحظر
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm transition-colors"
          >
            السابق
          </button>
          <span className="text-gray-400 text-sm">{page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm transition-colors"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
