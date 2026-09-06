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
  IoShieldCheckmarkOutline,
  IoRocketOutline,
  IoCardOutline,
} from "react-icons/io5";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { name, discountPercent = 0, color, storage, installment, freeDelivery, warrantyYears } = product;
  const image = product.images?.[0] || product.image;
  const resolvedImage = image ? resolveImg(image) : undefined;
  const originalPrice = product.originalPrice || product.price || 0;
  const salePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : undefined;
  const hasDiscount = salePrice != null && salePrice < originalPrice;
  const displayPrice = hasDiscount ? salePrice : originalPrice;

  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setToast(true);
    setTimeout(() => {
      setToast(false);
      setAdded(false);
      window.scrollTo(0, 0);
      router.push("/cart");
    }, 1000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-base font-medium animate-fade-in-down" style={{ backgroundColor: '#1F2C3E', color: '#DFC4A4' }}>
          <IoCheckmarkCircleOutline size={18} />
          تمت إضافة المنتج للسلة
        </div>
      )}

      <div
        className="product-card group relative flex flex-col h-full rounded-[20px] overflow-hidden border border-[#EBE6E2] hover:border-[#DFC4A4] transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(31,44,62,0.12)]"
        dir="rtl"
        style={{ backgroundColor: '#FFFFFF' }}
      >
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1">
        {/* ── Image Section ── */}
        <div className="relative w-full aspect-[4/3] sm:aspect-square overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>

          {/* Badge - top right */}
          {discountPercent > 0 ? (
            <div className="absolute z-10 top-2.5 right-2.5 sm:top-3 sm:right-3">
              <span className="text-[9px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#1F2C3E', color: '#DFC4A4' }}>
                خصم {discountPercent}%
              </span>
            </div>
          ) : (
            <div className="absolute z-10 top-2.5 right-2.5 sm:top-3 sm:right-3">
              <span className="text-[9px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#DFC4A4', color: '#1F2C3E' }}>
                جديد
              </span>
            </div>
          )}

          {/* Heart - top left */}
          <button
            onClick={handleLike}
            aria-label={liked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            className="absolute z-10 top-2.5 left-2.5 sm:top-3 sm:left-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
          >
            {liked ? (
              <IoHeart size={16} style={{ color: '#e74c3c' }} />
            ) : (
              <IoHeartOutline size={16} style={{ color: '#1F2C3E' }} />
            )}
          </button>

          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={name}
              fill
              className="object-contain p-5 sm:p-8 transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📱</div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 px-3 sm:px-4 pt-3 pb-2 gap-1.5 sm:gap-2">

          {/* Brand + Tags */}
          <div className="flex items-center gap-1 flex-wrap">
            {storage && (
              <span className="text-[8px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#F5EBE0', color: '#1F2C3E' }}>
                {storage}
              </span>
            )}
            {color && (
              <span className="text-[8px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#F5EBE0', color: '#1F2C3E' }}>
                {color}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-[12px] sm:text-[14px] font-bold leading-[1.5] line-clamp-2" style={{ color: '#121E2E' }}>
            {name}
          </h3>

          {/* Features icons row */}
          <div className="flex items-center gap-2 sm:gap-3 pt-1 border-t border-[#EBE6E2] mt-1">
            {freeDelivery && (
              <div className="flex items-center gap-0.5" title="توصيل مجاني">
                <IoRocketOutline size={12} style={{ color: '#1F2C3E' }} />
                <span className="text-[8px] sm:text-[9px] font-medium hidden sm:inline" style={{ color: '#1F2C3E' }}>مجاني</span>
              </div>
            )}
            {warrantyYears && warrantyYears > 0 && (
              <div className="flex items-center gap-0.5" title={`ضمان ${warrantyYears} سنة`}>
                <IoShieldCheckmarkOutline size={12} style={{ color: '#1F2C3E' }} />
                <span className="text-[8px] sm:text-[9px] font-medium hidden sm:inline" style={{ color: '#1F2C3E' }}>{warrantyYears} سنة</span>
              </div>
            )}
            {installment && (
              <div className="flex items-center gap-0.5" title="تقسيط">
                <IoCardOutline size={12} style={{ color: '#1F2C3E' }} />
                <span className="text-[8px] sm:text-[9px] font-medium hidden sm:inline" style={{ color: '#1F2C3E' }}>تقسيط</span>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Price section */}
          <div className="flex items-end justify-between gap-1 pt-2 border-t border-[#EBE6E2]">
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5">
                <span className="text-[16px] sm:text-[22px] font-black tracking-tight leading-none" style={{ color: '#121E2E' }}>
                  {fmt(displayPrice)}
                </span>
                <Image src="/money-icon.webp" alt="ر.س" width={20} height={15} className="inline-block object-contain" />
              </div>
            </div>
            {hasDiscount && (
              <span className="text-[9px] sm:text-[11px] line-through opacity-50 flex items-center gap-0.5" style={{ color: '#1F2C3E' }}>
                {fmt(originalPrice)} <Image src="/money-icon.webp" alt="ر.س" width={20} height={15} className="inline-block align-middle object-contain" />
              </span>
            )}
          </div>
        </div>

      </Link>

        {/* ── Cart button ── */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold transition-all duration-300 border-2 relative overflow-hidden ${added ? "" : "hover:scale-[1.03] active:scale-95 shimmer-btn"}`}
            style={{
              backgroundColor: added ? '#059669' : 'transparent',
              borderColor: added ? '#059669' : '#DFC4A4',
              color: added ? '#fff' : '#1F2C3E',
            }}
          >
            {added ? (
              <>
                <IoCheckmarkCircleOutline size={16} />
                تمت الإضافة
              </>
            ) : (
              <>
                <IoBagAddOutline size={16} />
                أضف للسلة
              </>
            )}
          </button>
        </div>

        <style jsx>{`
          @media (min-width: 1024px) {
            .shimmer-btn::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 60%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(223,196,164,0.3), transparent);
              animation: shimmer 4s infinite;
            }
          }
          @keyframes shimmer {
            0% { left: -100%; }
            70% { left: 100%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    </>
  );
}
