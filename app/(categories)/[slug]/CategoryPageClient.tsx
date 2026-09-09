"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IoHomeOutline,
  IoChevronBack,
  IoArrowForward,
  IoArrowBack,
  IoGridOutline,
  IoFlash,
  IoShieldCheckmarkOutline,
  IoRocketOutline,
  IoSparkles,
} from "react-icons/io5";
import ProductCard from "../../components/products/ProductCard";
import type { Product } from "../../components/products/types";
import { slugConfigs } from "../../lib/categoryConfig";
import { categoryBanners } from "../../lib/categoryBanners";
import { sortProducts } from "../../lib/sortProducts";
import { filterBySlug } from "../../lib/filterUtils";

// [FIX H5] Pure CSS animated background — no framer-motion dependency
function StaticHeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="cat-orb-1 absolute w-[400px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,.6) 0%, transparent 70%)", top: "-10%", right: "-5%" }} />
      <div className="cat-orb-2 absolute w-[350px] h-[350px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,.5) 0%, transparent 70%)", bottom: "-10%", left: "-5%" }} />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

const features = [
  { icon: IoRocketOutline, text: "شحن سريع" },
  { icon: IoShieldCheckmarkOutline, text: "ضمان معتمد" },
  { icon: IoFlash, text: "تقسيط مريح" },
];

export default function CategoryPageClient({ slug, initialProducts = [] }: { slug: string; initialProducts?: Product[] }) {
  const config = slugConfigs[slug];

  const [page, setPage] = useState(1);
  const [imgError, setImgError] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const bannerImage = categoryBanners[slug] || null;
  const hasBanner = bannerImage && !imgError;

  const products = useMemo(() => sortProducts(filterBySlug(initialProducts, slug)), [initialProducts, slug]);

  const label = config?.label ?? slug;
  const parentLabel = config?.parentLabel ?? "";
  const parentHref = config?.parentHref ?? "/";
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  return (
    <>
      <style>{`
        @keyframes heroShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes catOrb1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.05)}}
        @keyframes catOrb2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,20px) scale(0.95)}}
        @keyframes catFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hero-shimmer{background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);background-size:200% 100%;animation:heroShimmer 3s infinite}
        .cat-orb-1{animation:catOrb1 8s ease-in-out infinite}
        .cat-orb-2{animation:catOrb2 10s ease-in-out infinite}
        .cat-fade-up{animation:catFadeUp .5s ease both}
        .cat-fade-up-1{animation:catFadeUp .5s .1s ease both}
        .cat-fade-up-2{animation:catFadeUp .5s .2s ease both}
        .cat-fade-up-3{animation:catFadeUp .5s .35s ease both}
      `}</style>

      <main className="min-h-screen bg-[#f8f9fb]" dir="rtl">
        {/* ═══════════ HERO BANNER ═══════════ */}
        <div
          className="relative overflow-hidden h-[280px] sm:h-[340px] md:h-[400px] lg:h-[440px]"
          style={{ background: "linear-gradient(135deg, #0c4a4e 0%, #0a6b5a 30%, #147a6e 60%, #0f5e52 100%)" }}
        >
          {hasBanner ? (
            <>
              <Image
                src={bannerImage}
                alt={label}
                fill
                className="object-cover opacity-60 sm:opacity-70"
                style={{ objectPosition: "center 30%" }}
                priority
                sizes="100vw"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d3f] via-[#0a3d3f]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0a3d3f]/40" />
            </>
          ) : (
            <StaticHeroBg />
          )}

          <div className="absolute inset-0 hero-shimmer pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-between">
            {/* Breadcrumb */}
            <nav className="cat-fade-up flex items-center gap-1.5 text-[11px] sm:text-xs text-white/70 pt-5 sm:pt-7">
              <Link href="/" className="hover:text-white transition flex items-center gap-1">
                <IoHomeOutline size={13} />
                الرئيسية
              </Link>
              <IoChevronBack size={11} className="opacity-60" />
              <Link href={parentHref} className="hover:text-white transition">{parentLabel}</Link>
              <IoChevronBack size={11} className="opacity-60" />
              <span className="text-white font-medium">{label}</span>
            </nav>

            <div className="pb-10 sm:pb-14 md:pb-16">
              <div className="cat-fade-up-1 inline-flex items-center gap-2 text-[11px] font-bold text-white/90 bg-white/[.12] backdrop-blur-md px-4 py-2 rounded-full border border-white/[.15] mb-3 sm:mb-4">
                <IoSparkles size={13} className="text-emerald-300" />
                {parentLabel}
              </div>

              <h1
                className="cat-fade-up-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 sm:mb-4 max-w-xl"
                style={{ textShadow: "0 2px 24px rgba(0,0,0,.35)" }}
              >
                {label}
              </h1>

              <p
                className="cat-fade-up-2 text-xs sm:text-sm md:text-base text-white/70 mb-5 max-w-md"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,.2)" }}
              >
                اكتشف أفضل العروض والأسعار مع ضمان معتمد وتقسيط مريح
              </p>

              <div className="cat-fade-up-3 flex gap-2 sm:gap-3 flex-wrap items-center">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 sm:gap-2 bg-white/[.1] backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/[.12] text-white/90 text-[10px] sm:text-xs font-medium"
                  >
                    <f.icon size={14} className="text-emerald-300" />
                    {f.text}
                  </div>
                ))}
                {products.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-emerald-400/20 text-emerald-200 text-[10px] sm:text-xs font-bold">
                    <IoGridOutline size={13} />
                    {products.length} منتج
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[30px] sm:h-[50px]">
              <path d="M0,30 C360,60 720,0 1080,40 C1260,52 1380,42 1440,30 L1440,60 L0,60Z" fill="#f8f9fb" />
            </svg>
          </div>
        </div>

        {/* ═══════════ PRODUCTS GRID ═══════════ */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {!products.length ? (
            <div className="cat-fade-up flex flex-col items-center justify-center py-24 gap-5 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-5xl shadow-lg shadow-teal-100/50 border border-teal-100/50">
                📦
              </div>
              <div>
                <p className="text-gray-800 text-lg font-black mb-1.5">المنتجات ستُضاف قريباً</p>
                <p className="text-gray-400 text-sm">هذا القسم قيد التحضير، تابعنا للمزيد</p>
              </div>
              <Link
                href="/"
                className="mt-2 text-sm font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1.5 bg-teal-50 px-5 py-2.5 rounded-full transition-all hover:shadow-md hover:shadow-teal-100"
              >
                <IoArrowForward size={14} />
                العودة إلى الرئيسية
              </Link>
            </div>
          ) : (
            <>
              <div className="cat-fade-up flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200/50">
                    <IoGridOutline size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-900">جميع المنتجات</h2>
                    <p className="text-[11px] text-gray-400">صفحة {page} من {totalPages || 1}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-12">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold disabled:opacity-30 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm hover:shadow-md"
                  >
                    <IoArrowForward size={14} />
                    السابق
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xs sm:text-sm font-black transition-all ${
                        page === n
                          ? "bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-200/60 scale-110"
                          : "bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 shadow-sm"
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold disabled:opacity-30 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm hover:shadow-md"
                  >
                    التالي
                    <IoArrowBack size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
