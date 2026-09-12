"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IoCartOutline, IoShieldCheckmark, IoCarOutline,
  IoCheckmarkDoneCircle, IoFlash, IoBagCheckOutline, IoCheckmarkCircle,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "../../../components/products/types";
import { isIPhone18PreOrder, usePreOrderAvailability } from "../../../lib/usePreOrderAvailability";

const fmt = (n: number) => n.toLocaleString("en-US");

interface ProductInfoProps {
  product: Product;
  selectedColor: string;
  selectedStorage: string;
  addedToCart: boolean;
  onColorChange: (c: string) => void;
  onStorageChange: (s: string) => void;
  onAddToCart: () => void;
  onPreOrder?: () => void;
}

export default function ProductInfo({
  product, selectedColor, selectedStorage, addedToCart,
  onColorChange, onStorageChange, onAddToCart, onPreOrder,
}: ProductInfoProps) {
  const router = useRouter();
  const reservationStatus = usePreOrderAvailability();
  const isPreOrder = isIPhone18PreOrder(product.name);
  const { name, brand, freeDelivery, deliveryTime, inStock, taxIncluded, installment } = product;

  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = product.variants?.find((v) => v.color === selectedColor);
  const storageOpts = activeVariant?.storageOptions ?? product.variants?.[0]?.storageOptions ?? [];
  const toKey = (o: { storage: string; ram?: string; size?: string }) => `${o.storage}|${o.ram ?? ""}|${o.size ?? ""}`;
  const activeStorageOpt = storageOpts.find((o) => toKey(o) === selectedStorage) ?? storageOpts[0];

  const originalPrice = activeStorageOpt?.originalPrice ?? product.originalPrice ?? 0;
  const salePrice = activeStorageOpt?.salePrice ?? product.salePrice;
  const hasDiscount = salePrice != null && salePrice > 0 && salePrice < originalPrice;
  const savingsPercent = hasDiscount ? Math.round(((originalPrice - (salePrice ?? 0)) / originalPrice) * 100) : 0;

  return (
    <div className="lg:sticky lg:top-[72px]">
      <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid #EBE6E2", background: "#fff" }}>

        {/* ── Name + Brand + Stock ── */}
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
          <div className="flex items-center gap-2 mb-2">
            {brand && (
              <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#BC9255" }}>
                {brand}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full ${inStock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              {inStock ? "متوفر" : "غير متوفر"}
            </span>
          </div>
          <h2 className="lg:hidden text-sm sm:text-lg font-black leading-snug" style={{ color: "#1F2C3E" }}>{name}</h2>
        </div>

        {/* ── Color Selector ── */}
        {hasVariants && (
          <div className="px-4 sm:px-5 py-3 sm:py-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: "#A77D4B" }}>
              اللون — {selectedColor}
            </p>
            <div className="flex gap-2.5 sm:gap-3 flex-wrap">
              {product.variants!.map((v, i) => (
                <motion.button
                  key={`${i}-${v.color}`}
                  title={v.color}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onColorChange(v.color)}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: v.colorCode,
                    boxShadow: selectedColor === v.color
                      ? "0 0 0 2px #fff, 0 0 0 4px #BC9255"
                      : "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  {selectedColor === v.color && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <IoCheckmarkCircle size={13} className="text-white drop-shadow" />
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Storage Selector ── */}
        {storageOpts.length > 1 && (
          <div className="px-4 sm:px-5 py-3 sm:py-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: "#A77D4B" }}>السعة</p>
            <div className="flex gap-2 flex-wrap">
              {storageOpts.map((opt) => {
                const key = toKey(opt);
                const isActive = selectedStorage === key;
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => onStorageChange(key)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black border cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? "#BC9255" : "#faf7f2",
                      color: isActive ? "#fff" : "#1F2C3E",
                      borderColor: isActive ? "#BC9255" : "#EBE6E2",
                      boxShadow: isActive ? "0 4px 14px rgba(188,146,85,0.3)" : "none",
                    }}
                  >
                    {opt.storage}
                    {opt.ram && <span className="block text-[9px] mt-0.5 opacity-70">{opt.ram}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Price ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedStorage}-${selectedColor}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 sm:px-5 py-4 sm:py-5"
            style={{ borderBottom: "1px solid #f0ebe4", background: "linear-gradient(135deg, rgba(188,146,85,0.04), rgba(255,255,255,0))" }}
          >
            {hasDiscount ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black" style={{ color: "#BC9255" }}>{fmt(salePrice!)}</span>
                    <Image src="/money-icon.webp" alt="ر.س" width={28} height={28} style={{ width: 28, height: 28 }} className="inline-block mb-1" />
                  </div>
                  {taxIncluded && <p className="text-[10px] mt-1" style={{ color: "#A77D4B" }}>شامل ضريبة القيمة المضافة</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-lg text-white" style={{ background: "linear-gradient(135deg, #e74c3c, #c0392b)" }}>
                    وفّر {savingsPercent}%
                  </span>
                  <span className="text-xs sm:text-sm line-through opacity-40 flex items-center gap-1" style={{ color: "#1F2C3E" }}>
                    {fmt(originalPrice)} <Image src="/money-icon.webp" alt="ر.س" width={16} height={16} style={{ width: 16, height: 16 }} className="opacity-50" />
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black" style={{ color: "#BC9255" }}>{fmt(originalPrice)}</span>
                  <Image src="/money-icon.webp" alt="ر.س" width={28} height={28} style={{ width: 28, height: 28 }} className="inline-block mb-1" />
                </div>
                {taxIncluded && <p className="text-[10px] mt-1" style={{ color: "#A77D4B" }}>شامل ضريبة القيمة المضافة</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Installment ── */}
        {installment?.available && (
          <div className="px-4 sm:px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #f0ebe4", background: "rgba(188,146,85,0.04)" }}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(188,146,85,0.12)" }}>
              <IoFlash size={14} style={{ color: "#BC9255" }} />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold" style={{ color: "#1F2C3E" }}>
                تقسيط متاح {installment.downPayment ? `• مقدم ${fmt(installment.downPayment)} ر.س` : ""}
              </p>
              {installment.note && <p className="text-[10px] mt-0.5" style={{ color: "#A77D4B" }}>{installment.note}</p>}
            </div>
          </div>
        )}

        {/* ── Trust badges (توصيل + ضمان فقط) ── */}
        <div className="grid grid-cols-2 gap-px" style={{ background: "#f0ebe4" }}>
          {[
            { icon: IoCarOutline, label: freeDelivery ? "توصيل مجاني" : "توصيل مدفوع", sub: deliveryTime },
            { icon: IoShieldCheckmark, label: "ضمان سنتين", sub: null },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-3" style={{ background: "#fff" }}>
              <f.icon size={15} style={{ color: "#BC9255", flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold truncate" style={{ color: "#1F2C3E" }}>{f.label}</p>
                {f.sub && <p className="text-[9px] sm:text-[10px] truncate" style={{ color: "#A77D4B" }}>{f.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="p-3 sm:p-4">
          {isPreOrder ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onPreOrder}
              disabled={reservationStatus === "not_started"}
              className="group w-full relative overflow-hidden font-black text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2.5"
              style={{
                background: reservationStatus === "open"
                  ? "linear-gradient(135deg, #BC9255, #A77D4B)"
                  : "rgba(188,146,85,0.15)",
                color: reservationStatus === "open" ? "#fff" : "#A77D4B",
                boxShadow: reservationStatus === "open" ? "0 6px 24px rgba(188,146,85,0.35)" : "none",
                cursor: reservationStatus === "not_started" ? "not-allowed" : "pointer",
              }}
            >
              {reservationStatus === "open" && (
                <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              )}
              <span className="relative">
                {reservationStatus === "open" ? "احجز مسبقًا" : "الحجز يبدأ قريبًا"}
              </span>
            </motion.button>
          ) : !addedToCart ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onAddToCart}
              className="group w-full relative overflow-hidden font-black text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2.5 text-white"
              style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)", boxShadow: "0 6px 24px rgba(188,146,85,0.35)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <IoCartOutline size={18} className="relative" />
              <span className="relative">أضف للسلة</span>
            </motion.button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-2xl" style={{ backgroundColor: "rgba(16,185,129,0.08)", color: "#059669" }}>
                <IoCheckmarkDoneCircle size={17} />
                <span className="text-xs sm:text-sm font-bold">تمت الإضافة للسلة</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => router.back()} className="font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl" style={{ backgroundColor: "#faf7f2", color: "#1F2C3E", border: "1px solid #EBE6E2" }}>
                  متابعة التسوق
                </button>
                <button onClick={() => router.push("/cart")} className="text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)" }}>
                  <IoBagCheckOutline size={14} />
                  عرض السلة
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
