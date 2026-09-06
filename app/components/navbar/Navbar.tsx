"use client";

import { useState, useEffect, useSyncExternalStore, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { navItems } from "./data";
import { SearchIcon, CartIcon, MenuIcon, CloseIcon } from "./icons";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import { useCartStore } from "../../store/cartStore";
import { useCompanyStore } from "../../store/companyStore";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ _id: string; name: string; images?: string[]; image?: string; salePrice?: number; originalPrice?: number; price?: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const { logo, fetchCompany } = useCompanyStore();

  const API_IMG = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const resolveImg = (src: string) => src.startsWith("http") ? src : `${API_IMG}${src.startsWith("/") ? src : "/" + src}`;

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchResults]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className="sticky top-0 z-50 shadow-md" dir="rtl" style={{ background: 'linear-gradient(to bottom, #ffffff, #f5f0e8)', transform: 'translateZ(0)' }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Row 1: Logo + Icons (mobile: same row with hamburger) */}
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* Logo + Hamburger */}
          <div className="flex items-center gap-1">
            <button
              aria-label="القائمة"
              className="lg:hidden p-1 sm:p-2 rounded-full transition-colors"
              style={{ color: '#A77D4B' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <Link href="/" className="shrink-0">
              {logo && (
                <Image
                  src={logo}
                  alt="Logo"
                  width={0}
                  height={0}
                  sizes="80px"
                  className="h-16 sm:h-16 lg:h-20 w-auto"
                  priority
                />
              )}
            </Link>
          </div>

          {/* Desktop nav hidden here, shown in row 2 */}
          <div className="hidden lg:block" />

          {/* Icons */}
          <div className="flex items-center gap-0.5 sm:gap-2 md:gap-3">
            <button
              aria-label="بحث"
              className="p-1 sm:p-2 rounded-full transition-colors hover:bg-[#BC9255]/10"
              style={{ color: '#A77D4B' }}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <SearchIcon />
            </button>
            <Link href="/cart" aria-label="السلة" className="p-1 sm:p-2 rounded-full transition-colors hover:bg-[#BC9255]/10 relative" style={{ color: '#A77D4B' }}>
              <CartIcon />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Row 2: Desktop nav links (desktop only) */}
        <div className="hidden lg:flex justify-center border-t py-1" style={{ borderColor: 'rgba(188,146,85,0.25)' }}>
          <DesktopNav items={navItems} />
        </div>
      </div>

      {searchOpen && (
        <div ref={searchWrapRef} className="border-t px-4 py-2 relative" style={{ borderColor: 'rgba(188,146,85,0.25)', backgroundColor: '#faf7f2' }} dir="rtl">
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="flex-1 rounded-full px-4 py-1.5 text-sm outline-none text-[#0A1825] placeholder:text-[#A77D4B]/50"
              style={{ backgroundColor: '#fff', border: '1px solid #BC9255' }}
            />
            {searching && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#BC9255', borderTopColor: 'transparent' }} />
              </div>
            )}
          </div>

          {results.length > 0 && (
            <ul className="absolute right-4 left-4 bg-white rounded-xl shadow-lg mt-1 z-50 max-h-72 overflow-y-auto" style={{ border: '1px solid rgba(188,146,85,0.3)' }}>
              {results.map((p) => {
                const img = p.images?.[0] || p.image;
                const price = p.salePrice ?? p.originalPrice ?? p.price ?? 0;
                return (
                  <li key={p._id}>
                    <Link
                      href={`/product/${p._id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults([]); }}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#BC9255]/10"
                    >
                      {img && (
                        <Image src={resolveImg(img)} alt={p.name} width={40} height={40} className="object-contain rounded" unoptimized />
                      )}
                      <span className="flex-1 text-sm text-[#0A1825] line-clamp-1">{p.name}</span>
                      <span className="text-sm font-bold shrink-0" style={{ color: '#A77D4B' }}>{price.toLocaleString("en-US")} ر.س</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!searching && searchQuery.trim() && results.length === 0 && (
            <p className="text-center text-sm text-[#A77D4B]/70 py-3">لا توجد نتائج</p>
          )}
        </div>
      )}

      <MobileMenu items={navItems} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
  );
}
