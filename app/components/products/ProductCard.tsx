"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  IoBagAddOutline,
  IoCheckmarkCircleOutline,
  IoHeartOutline,
  IoHeart,
  IoInformationCircleOutline,
  IoClose,
} from "react-icons/io5";
import type { Product } from "./types";
import { normalizeProductForCard } from "../../lib/normalizeProduct";
import { useCartStore } from "../../store/cartStore";
import { isIPhone18PreOrder, usePreOrderAvailability } from "../../lib/usePreOrderAvailability";
import PreOrderModal from "../pre-order/PreOrderModal";

const fmt = (n: number) => n.toLocaleString("en-US");

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

export default function ProductCard({ product, priority = false, imageZoom = false, imageScale = "scale-110" }: { product: Product; priority?: boolean; imageZoom?: boolean; imageScale?: string }) {
  const { name, discountPercent, color, storage, image, originalPrice, salePrice } = normalizeProductForCard(product);
  const resolvedImage = image ? resolveImg(image) : undefined;
  const hasDiscount = salePrice != null;
  const displayPrice = hasDiscount ? salePrice : originalPrice;

  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [preOrderOpen, setPreOrderOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const router = useRouter();
  const reservationStatus = usePreOrderAvailability();
  const isPreOrder = isIPhone18PreOrder(name);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => router.push("/cart"), 1200);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
  };

  return (
    <>
      {added && (
        <div
          className="fixed top-5 left-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold"
          style={{
            backgroundColor: "#059669",
            color: "#fff",
            transform: "translateX(-50%)",
            animation: "toastIn 0.35s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          <IoCheckmarkCircleOutline size={20} />
          تمت الإضافة للسلة ✓
        </div>
      )}

      <div className="product-card group relative flex flex-col h-full rounded-2xl overflow-hidden" dir="rtl" style={{ backgroundColor: "#FFFFFF" }}>

        <Link href={`/product/${product._id}`} className="flex flex-col flex-1">

          {/* ── Image ── */}
          <div className={`relative w-full overflow-hidden ${imageZoom ? "aspect-[4/3]" : "aspect-square"}`} style={{ backgroundColor: "#FFFFFF" }}>

            {/* Badge */}
            <div className="absolute z-10 top-3 right-3">
              {discountPercent > 0 ? (
                <span className="text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ backgroundColor: "#1F2C3E", color: "#DFC4A4" }}>
                  {discountPercent}% خصم
                </span>
              ) : (
                <span className="text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ backgroundColor: "#DFC4A4", color: "#1F2C3E" }}>
                  جديد
                </span>
              )}
            </div>

            {resolvedImage ? (
              <Image
                src={resolvedImage}
                alt={name}
                fill
                className={`object-contain ${imageZoom ? `p-0 ${imageScale}` : "p-4"}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📱</div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col px-2.5 sm:px-3.5 pt-2 sm:pt-3 pb-2 sm:pb-3">

            {/* Tags */}
            {(storage || color) && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {storage && (
                  <span className="text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md" style={{ backgroundColor: "#F5EBE0", color: "#1F2C3E" }}>
                    {storage}
                  </span>
                )}
                {color && (
                  <span className="text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md" style={{ backgroundColor: "#F5EBE0", color: "#1F2C3E" }}>
                    {color}
                  </span>
                )}
              </div>
            )}

            {/* Name */}
            <h3 className="text-[12px] sm:text-[15px] md:text-[16px] font-bold leading-snug line-clamp-2" style={{ color: "#121E2E" }}>
              {name}
            </h3>

            {/* Divider */}
            <div className="my-2 border-t border-dashed" style={{ borderColor: "#DFC4A4" }} />

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[16px] sm:text-[20px] md:text-[23px] font-black leading-none" style={{ color: "#121E2E" }}>
                  {fmt(displayPrice)}
                </span>
                <Image src="/money-icon.webp" alt="ر.س" width={16} height={16} className="object-contain" />
              </div>
              {hasDiscount && (
                <span className="text-[9px] sm:text-[11px] line-through opacity-40 flex items-center gap-0.5" style={{ color: "#1F2C3E" }}>
                  {fmt(originalPrice)}
                  <Image src="/money-icon.webp" alt="ر.س" width={11} height={11} className="object-contain" />
                </span>
              )}
            </div>

          </div>
        </Link>

        {/* ── Cart / Pre-Order Button ── */}
        <div className="px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5">
          {isPreOrder ? (
            <div className="flex gap-1.5 sm:gap-2">
              {/* Details button */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDetailsOpen(true); }}
                className="flex-1 flex items-center justify-center gap-1 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[12px] font-bold transition-all duration-300 active:scale-95"
                style={{ backgroundColor: "rgba(31,44,62,0.07)", color: "#1F2C3E" }}
              >
                <IoInformationCircleOutline size={13} />
                <span>التفاصيل</span>
              </button>
              {/* Pre-order button */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreOrderOpen(true); }}
                disabled={reservationStatus === "not_started"}
                className="flex-1 flex items-center justify-center gap-1 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[12px] font-bold transition-all duration-300 active:scale-95"
                style={{
                  background: reservationStatus === "open"
                    ? "linear-gradient(135deg,#BC9255,#A77D4B)"
                    : "rgba(188,146,85,0.15)",
                  color: reservationStatus === "open" ? "#fff" : "#A77D4B",
                  cursor: reservationStatus === "not_started" ? "not-allowed" : "pointer",
                }}
              >
                {reservationStatus === "open" ? "احجز مسبقًا" : "قريبًا"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] md:text-[14px] font-bold transition-all duration-300 active:scale-95"
              style={{
                backgroundColor: added ? "#059669" : "#1F2C3E",
                color: added ? "#fff" : "#DFC4A4",
              }}
            >
              {added ? (
                <><IoCheckmarkCircleOutline size={15} />تمت الإضافة</>
              ) : (
                <><IoBagAddOutline size={15} />أضف للسلة</>
              )}
            </button>
          )}
        </div>

        {isPreOrder && (
          <PreOrderModal
            open={preOrderOpen}
            onClose={() => setPreOrderOpen(false)}
            product={{ _id: product._id, name, image, variants: product.variants, price: displayPrice ?? 0 }}
          />
        )}

        {/* ── Details Modal ── */}
        {detailsOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={() => setDetailsOpen(false)}
          >
            <style>{`
              @keyframes detailsUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
              .details-modal { animation: detailsUp 0.3s cubic-bezier(.22,1,.36,1) both }
            `}</style>
            <div
              className="details-modal w-full sm:max-w-sm mx-0 sm:mx-4 max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "#EBE6E2" }}>
                <div className="flex items-center gap-2">
                  {resolvedImage && (
                    <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: "#F5EBE0" }}>
                      <Image src={resolvedImage} alt={name} width={36} height={36} className="object-contain w-full h-full p-1" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold" style={{ color: "#A77D4B" }}>تفاصيل المنتج</p>
                    <h3 className="text-[13px] sm:text-sm font-black leading-tight line-clamp-1" style={{ color: "#1F2C3E" }}>{name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}
                >
                  <IoClose size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                {/* Price */}
                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#faf7f2", borderBottom: "1px solid #EBE6E2" }}>
                  <span className="text-[11px] font-semibold" style={{ color: "#A77D4B" }}>السعر</span>
                  <div className="flex items-center gap-1.5">
                    {hasDiscount && (
                      <span className="text-[10px] line-through opacity-40" style={{ color: "#1F2C3E" }}>{fmt(originalPrice)} ر.س</span>
                    )}
                    <span className="text-[15px] font-black" style={{ color: "#1F2C3E" }}>{fmt(displayPrice)} ر.س</span>
                  </div>
                </div>

                {/* Specs */}
                {(product.specs || (product.specGroups && product.specGroups.length > 0)) && (() => {
                  const specLabels: [string, string, string][] = [
                    ["screen", "الشاشة", "📱"],
                    ["processor", "المعالج", "⚡"],
                    ["ram", "الرام", "🧠"],
                    ["storage", "التخزين", "💾"],
                    ["rearCamera", "الكاميرا الخلفية", "📸"],
                    ["frontCamera", "الكاميرا الأمامية", "🤳"],
                    ["battery", "البطارية", "🔋"],
                    ["batteryLife", "عمر البطارية", "⏱️"],
                    ["charging", "الشحن", "🔌"],
                    ["os", "نظام التشغيل", "💻"],
                    ["extras", "مميزات إضافية", "✨"],
                  ];
                  const rows = product.specGroups?.length
                    ? product.specGroups.flatMap(g => g.items.map(item => ({ emoji: "•", label: item.key, value: item.value })))
                    : specLabels
                        .filter(([key]) => product.specs?.[key as keyof typeof product.specs])
                        .map(([key, label, emoji]) => ({ emoji, label, value: product.specs![key as keyof typeof product.specs] as string }));

                  if (!rows.length) return null;
                  return (
                    <div>
                      <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: "#A77D4B" }}>المواصفات</p>
                      {rows.map((row, i) => (
                        <div key={i} className="flex items-start gap-2.5 px-4 py-2" style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#faf7f2", borderTop: i > 0 ? "1px solid #EBE6E2" : "none" }}>
                          <span className="text-sm shrink-0 mt-0.5">{row.emoji}</span>
                          <span className="w-20 shrink-0 text-[10px] sm:text-[11px] font-semibold" style={{ color: "#A77D4B" }}>{row.label}</span>
                          <span className="flex-1 text-[10px] sm:text-[11px] font-semibold leading-snug" style={{ color: "#1F2C3E" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Description */}
                {product.description && (
                  <div className="px-4 py-3" style={{ borderTop: "1px solid #EBE6E2" }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#A77D4B" }}>الوصف</p>
                    <p className="text-[11px] sm:text-xs leading-relaxed font-medium" style={{ color: "#1F2C3E" }}>{product.description}</p>
                  </div>
                )}

                {/* No details fallback */}
                {!product.specs && !product.specGroups?.length && !product.description && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <span className="text-3xl">📦</span>
                    <p className="text-xs font-semibold" style={{ color: "#A77D4B" }}>لا توجد تفاصيل إضافية</p>
                  </div>
                )}
              </div>

              {/* Footer — CTA */}
              <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid #EBE6E2" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDetailsOpen(false); setPreOrderOpen(true); }}
                  disabled={reservationStatus === "not_started"}
                  className="w-full py-3 rounded-2xl text-[13px] font-black transition-all active:scale-95"
                  style={{
                    background: reservationStatus === "open"
                      ? "linear-gradient(135deg,#BC9255,#A77D4B)"
                      : "rgba(188,146,85,0.15)",
                    color: reservationStatus === "open" ? "#fff" : "#A77D4B",
                    cursor: reservationStatus === "not_started" ? "not-allowed" : "pointer",
                  }}
                >
                  {reservationStatus === "open" ? "احجز مسبقًا الآن" : "الحجز يبدأ قريبًا"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
