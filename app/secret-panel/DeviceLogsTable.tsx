"use client";
import { useState, useEffect, useCallback } from "react";

interface DeviceLog {
  _id: string;
  fingerprint: string | null;
  ip: string | null;
  country: string | null;
  userAgent: string | null;
  path: string | null;
  buyerName: string | null;
  label: string | null;
  firstSeen: string;
  lastSeen: string;
  requestsCount: number;
}

function parseUA(ua: string | null) {
  if (!ua) return { browser: "—", os: "—" };
  const browser =
    ua.includes("Chrome") && !ua.includes("Edg") ? "Chrome" :
    ua.includes("Firefox") ? "Firefox" :
    ua.includes("Safari") && !ua.includes("Chrome") ? "Safari" :
    ua.includes("Edg") ? "Edge" :
    ua.includes("OPR") || ua.includes("Opera") ? "Opera" : "أخرى";
  const os =
    ua.includes("Windows") ? "Windows" :
    ua.includes("Mac") ? "Mac" :
    ua.includes("Android") ? "Android" :
    ua.includes("iPhone") || ua.includes("iPad") ? "iOS" :
    ua.includes("Linux") ? "Linux" : "أخرى";
  return { browser, os };
}

export default function DeviceLogsTable({ onBlockSuccess }: { onBlockSuccess?: () => void }) {
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [editingLabel, setEditingLabel] = useState<{ id: string; value: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/secret/devices?type=logs&page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleBlock(log: DeviceLog) {
    const res = await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "block",
        fingerprint: log.fingerprint,
        ip: log.ip,
        userAgent: log.userAgent,
        reason: "",
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast("تم الحظر بنجاح ✓");
      fetchLogs();
      onBlockSuccess?.();
    } else {
      showToast("حدث خطأ أثناء الحظر");
    }
  }

  async function handleSetLabel(id: string, label: string) {
    await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-label", id, label }),
    });
    setEditingLabel(null);
    fetchLogs();
  }

  async function handleDeleteLog(id: string) {
    await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-log", id }),
    });
    fetchLogs();
  }

  async function handleDeleteAll() {
    await fetch("/api/secret/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-all-logs" }),
    });
    fetchLogs();
    showToast("تم حذف جميع السجلات ✓");
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
          placeholder="بحث بـ IP أو Fingerprint أو Browser..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 placeholder-gray-600"
        />
        <button
          onClick={() => { setSearch(searchInput); setPage(1); }}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          بحث
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-xs">إجمالي: {total} جهاز</p>
        {total > 0 && (
          <button
            onClick={handleDeleteAll}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
          >
            حذف الكل
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">جاري التحميل...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-600">لا توجد سجلات</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/60 text-gray-400 text-xs">
                <th className="px-4 py-3 text-right font-medium">#</th>
                <th className="px-4 py-3 text-right font-medium">التسمية</th>
                <th className="px-4 py-3 text-right font-medium">اشترى</th>
                <th className="px-4 py-3 text-right font-medium">IP</th>
                <th className="px-4 py-3 text-right font-medium">الدولة</th>
                <th className="px-4 py-3 text-right font-medium">Fingerprint</th>
                <th className="px-4 py-3 text-right font-medium">الصفحة</th>
                <th className="px-4 py-3 text-right font-medium">المتصفح</th>
                <th className="px-4 py-3 text-right font-medium">النظام</th>
                <th className="px-4 py-3 text-right font-medium">آخر زيارة</th>
                <th className="px-4 py-3 text-right font-medium">الطلبات</th>
                <th className="px-4 py-3 text-right font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log) => {
                const { browser, os } = parseUA(log.userAgent);
                return (
                  <tr key={log._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs">{(page - 1) * 20 + logs.indexOf(log) + 1}</td>
                    <td className="px-4 py-3 text-xs">
                      {editingLabel?.id === log._id ? (
                        <div className="flex gap-1">
                          <input
                            autoFocus
                            value={editingLabel.value}
                            onChange={(e) => setEditingLabel({ id: log._id, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSetLabel(log._id, editingLabel.value);
                              if (e.key === "Escape") setEditingLabel(null);
                            }}
                            className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-xs w-28 focus:outline-none focus:border-yellow-500"
                          />
                          <button onClick={() => handleSetLabel(log._id, editingLabel.value)} className="text-green-400 text-xs px-1">✓</button>
                          <button onClick={() => setEditingLabel(null)} className="text-gray-500 text-xs px-1">✕</button>
                        </div>
                      ) : (
                        <span
                          onClick={() => setEditingLabel({ id: log._id, value: log.label || "" })}
                          className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                          title="اضغط للتعديل"
                        >
                          {log.label ? (
                            <span className="bg-yellow-500/20 text-yellow-300 font-bold px-2 py-0.5 rounded">{log.label}</span>
                          ) : (
                            <span className="text-gray-600">+ تسمية</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.buyerName ? (
                        <span className="bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded">{log.buyerName}</span>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">{log.ip || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{log.country || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate" title={log.fingerprint || ""}>
                      {log.fingerprint ? log.fingerprint.slice(0, 12) + "..." : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-400 max-w-[140px] truncate" title={log.path || ""}>
                      {log.path || "/"}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{browser}</td>
                    <td className="px-4 py-3 text-gray-300">{os}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(log.lastSeen).toLocaleString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-1 rounded-lg">
                        {log.requestsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBlock(log)}
                          className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          حظر
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log._id)}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
