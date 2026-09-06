"use client";

import { useRouter } from "next/navigation";
import {
  IoCartOutline,
  IoShieldCheckmark,
  IoTimeOutline,
  IoCarOutline,
  IoCheckmarkDoneCircle,
  IoFlash,
  IoStorefront,
  IoBagCheckOutline,
} from "react-icons/io5";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("en-US");

interface ProductInfoProps {
  product: Product;
  addedToCart: boolean;
  onAddToCart: () => void;
}

export default function ProductInfo({ product, addedToCart, onAddToCart }: ProductInfoProps) {
  const router = useRouter();
  const { name, brand, color, storage, network, salePrice, taxIncluded, installment, freeDelivery, deliveryTime, inStock } = product;
  const originalPrice = product.originalPrice || product.price || 0;
  const hasDiscount = salePrice != null && salePrice > 0 && salePrice < originalPrice;
  const savingsPercent = hasDiscount ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:sticky lg:top-[72px]">
      {/* ─── Price Card ─── */}
      <div className="relative bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] overflow-hidden shadow-lg sm:shadow-xl shadow-black/[.03]" style={{ border: "1px solid #EBE6E2" }}>
        {/* Top accent line */}
        <div className="h-[3px] sm:h-1" style={{ background: "linear-gradient(90deg, #DFC4A4, #BC9255, #A77D4B, #BC9255, #DFC4A4)" }} />

        <div className="p-4 sm:p-5 md:p-7">
          {/* Stock + Brand */}
          <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] md:text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl ${
              inStock
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100/60"
                : "bg-red-50 text-red-500 border border-red-100/60"
            }`}>
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${inStock ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 ${inStock ? "bg-emerald-500" : "bg-red-500"}`} />
              </span>
              {inStock ? "متوفر الآن" : "غير متوفر"}
            </div>
            {brand && (
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-extrabold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl tracking-wide uppercase shrink-0" style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B", border: "1px solid rgba(188,146,85,0.2)" }}>
                {brand}
              </span>
            )}
          </div>

          {/* Name (mobile/tablet only) */}
          <h2 className="lg:hidden text-base sm:text-lg md:text-xl font-black leading-relaxed mb-3 sm:mb-4" style={{ color: "#1F2C3E" }}>{name}</h2>

          {/* Tags (mobile/tablet only) */}
          {(color || storage || network) && (
            <div className="lg:hidden flex gap-1.5 sm:gap-2 mb-4 sm:mb-5 flex-wrap">
              {[color, storage, network].filter(Boolean).map((t, i) => (
                <span key={i} className="text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl" style={{ backgroundColor: "#faf7f2", color: "#A77D4B", border: "1px solid #EBE6E2" }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Price Section */}
          <div className="relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-5" style={{ background: "linear-gradient(135deg, #faf7f2, #f5f0e8)" }}>
            {hasDiscount ? (
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-[1.6rem] sm:text-[2rem] md:text-[2.5rem] font-black leading-none tracking-tight" style={{ color: "#1F2C3E" }}>{fmt(salePrice)}</span>
                  <img src="/money-icon.webp" alt="ر.س" className="inline-block w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="text-xs sm:text-sm line-through flex items-center gap-0.5" style={{ color: "#A77D4B", opacity: 0.5 }}>{fmt(originalPrice)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4" /></span>
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-extrabold text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg" style={{ backgroundColor: "#e74c3c" }}>
                    خصم {savingsPercent}% • وفّر {fmt(originalPrice - salePrice)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-[1.6rem] sm:text-[2rem] md:text-[2.5rem] font-black leading-none tracking-tight" style={{ color: "#1F2C3E" }}>{fmt(originalPrice)}</span>
                <img src="/money-icon.webp" alt="ر.س" className="inline-block w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            {taxIncluded && <p className="text-[9px] sm:text-[10px] mt-2 sm:mt-2.5" style={{ color: "#A77D4B" }}>شامل ضريبة القيمة المضافة</p>}
          </div>

          {/* Installment */}
          {installment?.available && (
            <div className="rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-4 mb-4 sm:mb-5" style={{ background: "rgba(188,146,85,0.06)", border: "1px solid rgba(188,146,85,0.15)" }}>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(188,146,85,0.1)" }}>
                  <IoFlash size={14} className="sm:hidden" style={{ color: "#BC9255" }} />
                  <IoFlash size={17} className="hidden sm:block" style={{ color: "#BC9255" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs md:text-sm font-bold truncate" style={{ color: "#1F2C3E" }}>
                    تقسيط متاح {installment.downPayment ? <><span>• مقدم {fmt(installment.downPayment)}</span><img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4 mr-0.5" /></> : ""}
                  </p>
                  {installment.note && <p className="text-[9px] sm:text-[10px] mt-0.5 truncate" style={{ color: "#A77D4B" }}>{installment.note}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Cart Button (Desktop) */}
          <div className="hidden lg:block">
            {!addedToCart ? (
              <button
                onClick={onAddToCart}
                className="group w-full relative overflow-hidden font-bold text-sm md:text-base py-4 md:py-[18px] rounded-xl md:rounded-2xl flex items-center justify-center gap-2.5 sm:gap-3 transition-all active:scale-[.98] text-white"
                style={{ backgroundColor: "#BC9255", boxShadow: "0 8px 24px rgba(188,146,85,0.3)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <IoCartOutline size={20} className="relative transition-transform group-hover:scale-110 group-hover:-rotate-6 md:hidden" />
                <IoCartOutline size={22} className="relative transition-transform group-hover:scale-110 group-hover:-rotate-6 hidden md:block" />
                <span className="relative">أضف للسلة</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl" style={{ backgroundColor: "rgba(16,185,129,0.08)", color: "#059669", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <IoCheckmarkDoneCircle size={18} className="sm:hidden" />
                  <IoCheckmarkDoneCircle size={20} className="hidden sm:block" />
                  <span className="text-xs sm:text-sm font-bold">تمت الإضافة للسلة بنجاح</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    onClick={() => router.back()}
                    className="font-bold text-xs sm:text-sm py-3 sm:py-3.5 rounded-lg sm:rounded-xl transition-colors" style={{ backgroundColor: "#faf7f2", color: "#1F2C3E", border: "1px solid #EBE6E2" }}
                  >
                    متابعة التسوق
                  </button>
                  <button
                    onClick={() => router.push("/cart")}
                    className="text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:shadow-lg"
                    style={{ backgroundColor: "#BC9255", boxShadow: "0 4px 16px rgba(188,146,85,0.25)" }}
                  >
                    <IoBagCheckOutline size={14} className="sm:hidden" />
                    <IoBagCheckOutline size={16} className="hidden sm:block" />
                    عرض السلة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Trust Features Grid ─── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {[
          { icon: IoCarOutline, label: freeDelivery ? "توصيل مجاني" : "توصيل مدفوع", sub: deliveryTime, bg: "rgba(188,146,85,0.08)", iconColor: "#BC9255" },
          { icon: IoShieldCheckmark, label: "ضمان حاسبات العرب", sub: "سنتين", bg: "rgba(188,146,85,0.06)", iconColor: "#A77D4B" },
          { icon: IoStorefront, label: inStock ? "متوفر بالمخزون" : "غير متوفر", sub: null, bg: inStock ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", iconColor: inStock ? "#059669" : "#ef4444" },
          { icon: IoTimeOutline, label: "شحن سريع", sub: "خلال 24-48 ساعة", bg: "rgba(188,146,85,0.05)", iconColor: "#BC9255" },
        ].map((f, i) => (
          <div key={i} className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default" style={{ border: "1px solid #EBE6E2" }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: f.bg }}>
              <f.icon size={16} className="sm:hidden" style={{ color: f.iconColor }} />
              <f.icon size={19} className="hidden sm:block" style={{ color: f.iconColor }} />
            </div>
            <p className="text-[10px] sm:text-[11px] md:text-xs font-bold leading-snug" style={{ color: "#1F2C3E" }}>{f.label}</p>
            {f.sub && <p className="text-[8px] sm:text-[9px] md:text-[10px] mt-0.5 sm:mt-1" style={{ color: "#A77D4B" }}>{f.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
