"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoArrowForward, IoShareSocial, IoHomeOutline, IoChevronBack } from "react-icons/io5";
import Link from "next/link";
import type { Product } from "../../components/products/types";
import { useCartStore } from "../../store/cartStore";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductDetails from "./components/ProductDetails";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductPageClient({ id, initialProduct }: { id: string; initialProduct?: Product | null }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
  const [loading, setLoading] = useState(!initialProduct);
  const [addedToCart, setAddedToCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (initialProduct) return;
    fetch(`${API}/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, initialProduct]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  if (loading)
    return (
      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f0e8" }}>
        <div className="h-[160px] sm:h-[200px]" style={{ background: "linear-gradient(to bottom, #ffffff, #f5f0e8)" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-16 sm:pt-20">
            <div className="h-3 sm:h-4 w-24 sm:w-32 bg-[#BC9255]/10 rounded-full animate-pulse" />
            <div className="h-5 sm:h-7 w-48 sm:w-64 bg-[#BC9255]/10 rounded-full animate-pulse mt-2 sm:mt-3" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 -mt-6 sm:-mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl">
              <div className="aspect-square bg-[#faf7f2] rounded-xl sm:rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-5 space-y-3 sm:space-y-4">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-3 sm:space-y-4">
                <div className="h-4 sm:h-5 w-20 sm:w-24 bg-[#faf7f2] rounded-full animate-pulse" />
                <div className="h-5 sm:h-7 w-3/4 sm:w-4/5 bg-[#faf7f2] rounded-full animate-pulse" />
                <div className="h-8 sm:h-10 w-2/5 bg-[#faf7f2] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f0e8" }}>
        <p className="text-gray-400 text-base sm:text-lg">المنتج غير موجود</p>
      </div>
    );

  const resolveImg = (src: string) =>
    src.startsWith("http") ? src : src.startsWith("/uploads") ? src : `${API}${src}`;
  const merged = [...(product.images || []), ...(product.image ? [product.image] : [])];
  const allImages = [...new Set(merged)].map(resolveImg);

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {}
  };

  return (
    <>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleUp{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .pdp-slide{animation:slideUp .55s cubic-bezier(.22,1,.36,1) both}
        .pdp-pop{animation:scaleUp .5s cubic-bezier(.22,1,.36,1) both}
        .pdp-cta-shine{background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);background-size:200% 100%;animation:shimmer 2.5s infinite}
      `}</style>

      <main className="min-h-screen pb-24 sm:pb-28 lg:pb-8" dir="rtl" style={{ background: "#f5f0e8" }}>
        {/* ─── Sticky Nav ─── */}
        <div className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.04)]" : ""}`} style={{ background: scrolled ? "rgba(255,255,255,0.97)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-300"
                style={{
                  backgroundColor: scrolled ? "rgba(188,146,85,0.08)" : "rgba(255,255,255,0.7)",
                  color: "#A77D4B",
                  border: "1px solid rgba(188,146,85,0.15)",
                }}
              >
                <IoArrowForward size={17} className="sm:hidden" />
                <IoArrowForward size={19} className="hidden sm:block" />
              </button>
              <h1
                className={`text-xs sm:text-sm font-bold truncate max-w-[140px] sm:max-w-[180px] md:max-w-xs transition-all duration-300 ${
                  scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                }`}
                style={{ color: "#1F2C3E" }}
              >
                {product.name}
              </h1>
            </div>
            <button
              onClick={handleShare}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: scrolled ? "rgba(188,146,85,0.08)" : "rgba(255,255,255,0.7)",
                color: "#A77D4B",
                border: "1px solid rgba(188,146,85,0.15)",
              }}
            >
              <IoShareSocial size={15} className="sm:hidden" />
              <IoShareSocial size={17} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* ─── Hero Banner (Light) ─── */}
        <div className="-mt-[49px] sm:-mt-[52px] pt-[49px] sm:pt-[52px] relative overflow-hidden" style={{ background: "linear-gradient(to bottom, #ffffff, #f5f0e8)" }}>
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #DFC4A4, #BC9255, #DFC4A4, transparent)" }} />

          {/* Subtle pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #BC9255 1px, transparent 0)", backgroundSize: "40px 40px" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-5 sm:pt-8 md:pt-12 pb-10 sm:pb-14 md:pb-20">
            {/* Breadcrumb */}
            <nav className="pdp-slide flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] md:text-xs mb-4 sm:mb-6 md:mb-8 overflow-x-auto scrollbar-hide whitespace-nowrap" style={{ color: "#A77D4B" }}>
              <Link href="/" className="hover:text-[#BC9255] transition flex items-center gap-1 shrink-0">
                <IoHomeOutline size={11} className="sm:hidden" />
                <IoHomeOutline size={13} className="hidden sm:block" />
                الرئيسية
              </Link>
              <IoChevronBack size={9} className="opacity-50 shrink-0 sm:hidden" />
              <IoChevronBack size={11} className="opacity-50 shrink-0 hidden sm:block" />
              {product.category && (
                <>
                  <span className="shrink-0 opacity-70">{product.category}</span>
                  <IoChevronBack size={9} className="opacity-50 shrink-0 sm:hidden" />
                  <IoChevronBack size={11} className="opacity-50 shrink-0 hidden sm:block" />
                </>
              )}
              <span className="font-medium truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" style={{ color: "#1F2C3E" }}>{product.name}</span>
            </nav>

            {/* Product title area */}
            <div className="max-w-2xl">
              {product.brand && (
                <div className="pdp-slide mb-2 sm:mb-3">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-[11px] font-bold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full tracking-wider uppercase" style={{ color: "#BC9255", backgroundColor: "rgba(188,146,85,0.1)", border: "1px solid rgba(188,146,85,0.2)" }}>
                    {product.brand}
                  </span>
                </div>
              )}
              <h2 className="pdp-slide text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black leading-[1.35] tracking-tight" style={{ animationDelay: ".06s", color: "#1F2C3E" }}>
                {product.name}
              </h2>
              {(product.color || product.storage || product.network) && (
                <div className="pdp-slide flex gap-1.5 sm:gap-2 flex-wrap mt-2.5 sm:mt-4" style={{ animationDelay: ".12s" }}>
                  {[product.color, product.storage, product.network].filter(Boolean).map((t, i) => (
                    <span key={i} className="text-[9px] sm:text-[10px] md:text-[11px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-medium" style={{ color: "#A77D4B", backgroundColor: "rgba(188,146,85,0.08)", border: "1px solid rgba(188,146,85,0.15)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Curved bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[20px] sm:h-[30px] md:h-[45px]">
              <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60Z" fill="#f5f0e8" />
            </svg>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 -mt-2 sm:-mt-4 md:-mt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-8">
            <div className="lg:col-span-7 pdp-pop">
              <ProductImages images={allImages} name={product.name} discountPercent={product.discountPercent} />
            </div>
            <div className="lg:col-span-5 pdp-pop" style={{ animationDelay: ".1s" }}>
              <ProductInfo
                product={product}
                addedToCart={addedToCart}
                onAddToCart={() => { addItem(product); setAddedToCart(true); }}
              />
            </div>
          </div>

          <ProductDetails installment={product.installment} description={product.description} specs={product.specs} />
        </div>

        {/* ─── Mobile Floating CTA ─── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
          <div className="backdrop-blur-2xl border-t px-3 sm:px-4 py-2.5 sm:py-3.5" style={{ backgroundColor: "rgba(255,255,255,0.97)", borderColor: "rgba(188,146,85,0.15)", boxShadow: "0 -4px 24px rgba(0,0,0,.04)" }}>
            <div className="flex items-center gap-2.5 sm:gap-3" dir="rtl">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] truncate mb-0.5" style={{ color: "#A77D4B" }}>{product.name}</p>
                <div className="flex items-baseline gap-0.5 sm:gap-1">
                  <span className="text-base sm:text-lg font-black" style={{ color: "#1F2C3E" }}>
                    {(product.salePrice ?? product.originalPrice ?? 0).toLocaleString("en-US")}
                  </span>
                  <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              {!addedToCart ? (
                <button
                  onClick={() => { addItem(product); setAddedToCart(true); }}
                  className="relative overflow-hidden font-bold text-xs sm:text-sm px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl active:scale-[.97] transition-transform"
                  style={{ backgroundColor: "#BC9255", color: "#fff", boxShadow: "0 6px 20px rgba(188,146,85,0.3)" }}
                >
                  <span className="absolute inset-0 pdp-cta-shine" />
                  <span className="relative">أضف للسلة</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push("/cart")}
                  className="font-bold text-xs sm:text-sm px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2"
                  style={{ backgroundColor: "#BC9255", color: "#fff", boxShadow: "0 6px 20px rgba(188,146,85,0.3)" }}
                >
                  <span>عرض السلة</span>
                  <span>✓</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
