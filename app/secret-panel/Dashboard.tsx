"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DeviceLogsTable from "./DeviceLogsTable";
import BlockedTable from "./BlockedTable";

type Tab = "logs" | "blocked";

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("logs");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logsKey, setLogsKey] = useState(0);
  const [blockedKey, setBlockedKey] = useState(0);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/secret/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base">لوحة أمان الأجهزة</h1>
            <p className="text-gray-500 text-xs">مراقبة وحظر الأجهزة</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {loggingOut ? "..." : "خروج"}
        </button>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex gap-2 bg-gray-900 p-1 rounded-xl w-fit mb-6 border border-gray-800">
          <button
            onClick={() => setTab("logs")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "logs"
                ? "bg-red-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            سجل الزوار
          </button>
          <button
            onClick={() => setTab("blocked")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "blocked"
                ? "bg-red-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            الأجهزة المحظورة
          </button>
        </div>

        {tab === "logs" ? (
          <DeviceLogsTable key={logsKey} onBlockSuccess={() => { setBlockedKey(k => k + 1); setTab("blocked"); }} />
        ) : (
          <BlockedTable key={blockedKey} onUnblockSuccess={() => { setLogsKey(k => k + 1); setTab("logs"); }} />
        )}
      </div>
    </div>
  );
}
