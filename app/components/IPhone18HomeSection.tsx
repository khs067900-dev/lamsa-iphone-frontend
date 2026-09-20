"use client";

import { useRouter } from "next/navigation";
import Image from "./ProductImage";
import type { FeaturedEntry } from "../lib/iphone18Featured";
import type { Product } from "./products/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

const fmt = (n: number) => n.toLocaleString("en-US");

// ── slug configs ──────────────────────────────────────────────────────────────
// ── single card ───────────────────────────────────────────────────────────────
function IPhone18Card({ product, label }: { product: Product; label: string }) {
  const router = useRouter();

  const img = product.images?.[0] || product.image;
  const resolvedImg = img ? resolveImg(img) : undefined;

  const price =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.originalPrice || product.price || 0;

  const hasDiscount =
    !!product.salePrice &&
    product.salePrice > 0 &&
    !!product.originalPrice &&
    product.originalPrice > product.salePrice;

  return (
    <>
      <div
        className="relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EBE6E2] w-full"
        style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #F8F5F1 100%)" }}
      >
        {/* Model badge */}
        {label && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "#1F2C3E", color: "#DFC4A4" }}
            >
              {label}
            </span>
          </div>
        )}

        {/* Image */}
        <div
          className="relative w-full aspect-[3/2] cursor-pointer overflow-hidden"
          onClick={() => router.push(`/product/${product._id}`)}
        >
          {resolvedImg && (
            <Image
              src={resolvedImg}
              alt={product.name}
              fill
              className="object-contain scale-[1.2] transition-all duration-500 hover:scale-[1.3]"
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 68px) / 2), 352px"
            />
          )}
          {hasDiscount && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-black"
              style={{ background: "linear-gradient(135deg,#e74c3c,#c0392b)", color: "#fff" }}
            >
              خصم
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col p-4 sm:p-5 border-t border-[#EBE6E2]/60 flex-1">
          <p className="text-[10px] font-semibold mb-0.5" style={{ color: "rgba(31,44,62,0.4)" }}>
            Apple · iPhone 18
          </p>
          <h3
            className="text-[13px] sm:text-[14px] font-black leading-snug mb-2 cursor-pointer line-clamp-2"
            style={{ color: "#1F2C3E" }}
            onClick={() => router.push(`/product/${product._id}`)}
          >
            {product.name}
          </h3>

          <div className="mb-3 mt-auto">
            <p
              className="text-[18px] sm:text-[20px] font-black leading-none"
              style={{ color: "#1F2C3E" }}
            >
              {fmt(price)}{" "}
              <span className="text-[11px] font-medium" style={{ color: "rgba(31,44,62,0.45)" }}>
                ر.س
              </span>
            </p>
            {hasDiscount && (
              <p className="text-[10px] line-through mt-0.5" style={{ color: "rgba(31,44,62,0.35)" }}>
                {fmt(product.originalPrice!)} ر.س
              </p>
            )}
          </div>

          {/* Buttons */}
          <button
            onClick={() => router.push(`/product/${product._id}`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#1F2C3E,#2a3d55)", color: "#DFC4A4" }}
          >
            اطلب الآن
          </button>
        </div>

        {/* inner glow border */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(223,196,164,0.3)" }}
        />
      </div>
    </>
  );
}

export default function IPhone18HomeSection({ entries }: { entries: FeaturedEntry[] }) {

  return (
    <section
      className="w-full py-10 sm:py-14"
      dir="rtl"
      style={{ background: "linear-gradient(to bottom, #FFF8F0, #ffffff)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <span
            className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(167,125,75,0.12)", color: "#A77D4B" }}
          >
            متاح الآن
          </span>
          <h2 className="text-2xl sm:text-4xl font-black" style={{ color: "#1F2C3E" }}>
            iPhone 18{" "}
            <span style={{ color: "#A77D4B" }}>احجز موديلك</span>
          </h2>
          <p className="text-sm" style={{ color: "rgba(31,44,62,0.5)" }}>
            اختر من بين ثلاثة موديلات — Pro Max، Pro، و Duo
          </p>
        </div>

        {/* Cards */}
        {(
          <>
            {entries.length === 0 ? null : (
              <div
                className={`grid gap-4 sm:gap-5 ${
                  entries.length === 1
                    ? "grid-cols-1 max-w-sm mx-auto"
                    : entries.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {entries.map(({ slug, label, product }) => (
                  <IPhone18Card key={slug} product={product} label={label} />
                ))}
              </div>
            )}
          </>
        )}


      </div>
    </section>
  );
}
