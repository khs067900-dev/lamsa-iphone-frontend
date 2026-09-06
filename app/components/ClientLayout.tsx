"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";
import { useFingerprint, getFingerprint } from "../lib/useFingerprint";

export default function ClientLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  useFingerprint();
  const isAdmin = pathname.startsWith("/admin");
  const isFilePage = pathname.startsWith("/file");
  const isSecretPanel = pathname.startsWith("/secret-panel");
  const isBlocked = pathname.startsWith("/blocked");
  const hideLayout = isAdmin || isFilePage || isSecretPanel || isBlocked;

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
    const id = setInterval(check, 3000);
    return () => clearInterval(id);
  }, [isBlocked]);

  const lastTracked = useRef("");
  useEffect(() => {
    if (hideLayout) return;
    const key = pathname;
    if (lastTracked.current === key) return;
    lastTracked.current = key;

    const send = (fp: string | null) =>
      fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint: fp, path: pathname }),
      }).catch(() => {});

    const fp = getFingerprint();
    if (fp) { send(fp); return; }

    // fingerprint still loading — wait up to 2s
    let tries = 0;
    const id = setInterval(() => {
      const f = getFingerprint();
      if (f || ++tries >= 20) { clearInterval(id); send(f); }
    }, 100);
    return () => clearInterval(id);
  }, [pathname, hideLayout]);

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && footer}
      {!hideLayout && <WhatsappButton />}
    </>
  );
}
