"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoInformationCircleOutline } from "react-icons/io5";
import type { Product } from "../../../../components/products/types";
import { slugConfigs } from "../../../../lib/categoryConfig";
import { sortProducts } from "../../../../lib/sortProducts";
import { isIPhone18PreOrder, usePreOrderAvailability } from "../../../../lib/usePreOrderAvailability";
import PreOrderModal from "../../../../components/pre-order/PreOrderModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;
const fmt = (n: number) => n.toLocaleString("en-US");

function normalizeArabic(str: string) {
  return str
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

function filterBySlugConfig(products: Product[], slug: string): Product[] {
  const config = slugConfigs[slug];
  if (!config) return [];
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category
      ? category.includes(",")
        ? category.split(",").some((c) =>
            normalizeArabic(p.category || "").includes(normalizeArabic(c.trim()))
          )
        : normalizeArabic(p.category || "").includes(normalizeArabic(category))
      : true;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    const matchExclude = nameExcludes?.length
      ? !nameExcludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    return matchBrand && matchCategory && matchName && matchExclude;
  });
}

// label لكل slug يظهر فوق الكارت
const SLUG_LABELS: Record<string, string> = {
  "iphone-18-pro-max": "Pro Max",
  "iphone-18-pro": "Pro",
  "iphone-18-duo": "Duo",
};

interface Props {
  allProducts: Product[];
  featuredSlugs: readonly string[];
}

function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const router = useRouter();
  const reservationStatus = usePreOrderAvailability();
  const [preOrderOpen, setPreOrderOpen] = useState(false);

  const img = product.images?.[0] || product.image;
  const resolvedImg = img ? resolveImg(img) : undefined;
  const price =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.originalPrice || (product as any).price || 0;
  const hasDiscount =
    product.salePrice &&
    product.salePrice > 0 &&
    product.originalPrice &&
    product.originalPrice > product.salePrice;
  const isPreOrder = isIPhone18PreOrder(product.name);
  const label = SLUG_LABELS[slug] ?? "";

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
              sizes="(max-width: 640px) 100vw, 33vw"
              priority
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
              <p
                className="text-[10px] line-through mt-0.5"
                style={{ color: "rgba(31,44,62,0.35)" }}
              >
                {fmt(product.originalPrice!)} ر.س
              </p>
            )}
          </div>

          {/* Buttons */}
          {isPreOrder ? (
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/product/${product._id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all active:scale-95"
                style={{ backgroundColor: "rgba(31,44,62,0.07)", color: "#1F2C3E" }}
              >
                <IoInformationCircleOutline size={14} className="shrink-0" />
                التفاصيل
              </button>
              <button
                onClick={() => setPreOrderOpen(true)}
                disabled={reservationStatus === "not_started"}
                className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all active:scale-95"
                style={{
                  background:
                    reservationStatus === "open"
                      ? "linear-gradient(135deg,#BC9255,#A77D4B)"
                      : "rgba(188,146,85,0.15)",
                  color: reservationStatus === "open" ? "#fff" : "#A77D4B",
                  cursor: reservationStatus === "not_started" ? "not-allowed" : "pointer",
                }}
              >
                {reservationStatus === "open" ? "احجز" : "قريبًا"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push(`/product/${product._id}`)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#1F2C3E,#2a3d55)", color: "#DFC4A4" }}
            >
              اطلب الآن
            </button>
          )}
        </div>

        {/* Border glow */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(223,196,164,0.3)" }}
        />
      </div>

      {isPreOrder && (
        <PreOrderModal
          open={preOrderOpen}
          onClose={() => setPreOrderOpen(false)}
          product={{
            _id: product._id,
            name: product.name,
            image: product.image,
            variants: product.variants,
            price,
          }}
        />
      )}
    </>
  );
}

export default function IPhone18StandardProducts({ allProducts, featuredSlugs }: Props) {
  // لكل slug، اجيب أول منتج مطابق
  const entries = featuredSlugs
    .map((slug) => {
      const sorted = sortProducts(filterBySlugConfig(allProducts, slug));
      return sorted.length > 0 ? { slug, product: sorted[0] } : null;
    })
    .filter((e): e is { slug: string; product: Product } => e !== null);

  if (entries.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#BC9255" }} />
        <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#1F2C3E" }}>
          اختر موديلك
        </h2>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: "#F5EBE0", color: "#A77D4B" }}
        >
          {entries.length} موديل
        </span>
      </div>

      {/* Grid — 1 col on mobile, up to 3 on desktop */}
      <div
        className={`grid gap-4 sm:gap-5 ${
          entries.length === 1
            ? "grid-cols-1 max-w-sm mx-auto"
            : entries.length === 2
            ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {entries.map(({ slug, product }) => (
          <ProductCard key={slug} product={product} slug={slug} />
        ))}
      </div>
    </section>
  );
}
