"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLogin = pathname === "/admin/login";
  const isPrint = pathname.endsWith("/print") || pathname.endsWith("/receipt") || pathname.endsWith("/invoice") || pathname.endsWith("/contract") || pathname.endsWith("/cancellation");

  if (isLogin || isPrint) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Toaster position="top-right" toastOptions={{ style: { fontSize: "14px", padding: "12px 16px", maxWidth: "320px", fontWeight: "600" } }} />
      <main className="md:mr-64 pt-20 min-h-screen overflow-x-hidden">
        <div className="px-3 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
