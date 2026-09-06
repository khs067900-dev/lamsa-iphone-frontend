"use client";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCompanyStore } from "../../store/companyStore";

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { logo, fetchCompany } = useCompanyStore();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrdersCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    // Replace current history entry so back button won't return to admin pages
    window.location.replace("/admin/login");
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50" dir="rtl">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <Menu size={22} />
        </button>
        {logo && logo.startsWith("http") && (
          <Image
            src={logo}
            alt="Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-20 sm:h-20 lg:h-30 w-auto"
            unoptimized
            priority
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin/orders")}
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <Bell size={20} />
          {ordersCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {ordersCount > 99 ? "99+" : ordersCount}
            </span>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-2 rounded-xl transition-colors text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">تسجيل خروج</span>
        </button>

      </div>
    </nav>
  );
}
