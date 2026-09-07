"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";
import { useFingerprint, getFingerprint } from "../lib/useFingerprint";
import { pingBackend } from "../lib/productsCache";

export default function ClientLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  useFingerprint();
  const isAdmin = pathname.startsWith("/admin");
  const isFilePage = pathname.startsWith("/file");
  const isSecretPanel = pathname.startsWith("/secret-panel");
  const isBlocked = pathname.startsWith("/blocked");
  const hideLayout = isAdmin || isFilePage || isSecretPanel || isBlocked;

  // Keep backend warm every 4 minutes to prevent Vercel cold start
  useEffect(() => {
    pingBackend();
    const id = setInterval(pingBackend, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Poll block status every 15s — redirect immediately if blocked
  useEffect(() => {
    if (isBlocked) return;
    const check = async () => {
      const fp = getFingerprint();
      if (!fp) return;
      try {
        const res = await fetch(`/api/secret/check-block?fp=${fp}`, { cache: "no-store" });
        const data = await res.json();
        if (data.blocked) window.location.href = "/blocked";
      } catch { /* fail open */ }
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [isBlocked]);

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && footer}
      {!hideLayout && <WhatsappButton />}
    </>
  );
}
