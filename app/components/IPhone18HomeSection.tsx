"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IoInformationCircleOutline } from "react-icons/io5";
import { sortProducts } from "../lib/sortProducts";
import { isIPhone18PreOrder, usePreOrderAvailability } from "../lib/usePreOrderAvailability";
import type { Product } from "./products/types";
import dynamic from "next/dynamic";

const PreOrderModal = dynamic(() => import("./pre-order/PreOrderModal"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

const fmt = (n: number) => n.toLocaleString("en-US");

// ── slug configs ──────────────────────────────────────────────────────────────
const FEATURED: { slug: string; label: string; category: string; nameExcludes?: string[] }[] = [
  { slug: "iphone-18-pro-max", label: "Pro Max", category: "ابل ايفون 18 برو ماكس" },
  { slug: "iphone-18-pro",     label: "Pro",     category: "ابل ايفون 18 برو", nameExcludes: ["ماكس", "max"] },
  { slug: "iphone-18-duo",     label: "Duo",     category: "ابل ايفون 18", nameExcludes: ["برو", "pro", "ماكس", "max"] },
];

function normalizeAr(s: string) {
  return s.replace(/[أإآا]/g, "ا").replace(/[ىي]/g, "ي").replace(/ة/g, "ه").replace(/[ؤئ]/g, "و");
}

function pickProduct(products: Product[], cfg: (typeof FEATURED)[0]): Product | null {
  const filtered = products.filter((p) => {
    const cat = normalizeAr(p.category || "");
    const name = p.name?.toLowerCase() || "";
    if (!cat.includes(normalizeAr(cfg.category))) return false;
    if (cfg.nameExcludes?.some((kw) => name.includes(kw.toLowerCase()))) return false;
    return true;
  });
  const sorted = sortProducts(filtered);
  return sorted[0] ?? null;
}

// ── single card ───────────────────────────────────────────────────────────────
function IPhone18Card({ product, label }: { product: Product; label: string }) {
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
    !!product.salePrice &&
    product.salePrice > 0 &&
    !!product.originalPrice &&
    product.originalPrice > product.salePrice;

  const isPreOrder = isIPhone18PreOrder(product.name);

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

        {/* inner glow border */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(223,196,164,0.3)" }}
        />
      </div>

      {isPreOrder && (
        <PreOrderModal
          open={preOrderOpen}
          onClose={() => setPreOrderOpen(false)}
          product={{ _id: product._id, name: product.name, image: product.image, variants: product.variants, price }}
        />
      )}
    </>
  );
}

// ── section skeleton loader ───────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EBE6E2] animate-pulse"
          style={{ background: "#F8F5F1" }}
        >
          <div className="aspect-[3/2] bg-[#EDE8E3]" />
          <div className="p-4 sm:p-5 space-y-3">
            <div className="h-3 w-1/3 rounded bg-[#EDE8E3]" />
            <div className="h-4 w-3/4 rounded bg-[#EDE8E3]" />
            <div className="h-6 w-1/2 rounded bg-[#EDE8E3]" />
            <div className="h-10 w-full rounded-xl bg-[#EDE8E3]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── main section ─────────────────────────────────────────────────────────────
export default function IPhone18HomeSection() {
  const [entries, setEntries] = useState<{ slug: string; label: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Use the Next.js rewrite proxy (/api/* → backend) to stay within CSP 'self'
        const res = await fetch(
          `/api/products?page=1&limit=500&fields=name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,price,variants`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const allProducts: Product[] = Array.isArray(data) ? data : (data.products ?? []);
        if (cancelled) return;
        const picked = FEATURED.map((cfg) => {
          const product = pickProduct(allProducts, cfg);
          return product ? { slug: cfg.slug, label: cfg.label, product } : null;
        }).filter((e): e is { slug: string; label: string; product: Product } => e !== null);
        setEntries(picked);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

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
        {loading ? <Skeleton /> : (
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

        {/* CTA */}
        <div className="flex justify-center mt-8">
          <Link
            href="/smartphones/apple/iphone-18"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#1F2C3E,#2a3d55)", color: "#DFC4A4" }}
          >
            عرض جميع موديلات iPhone 18
            <span className="text-base">←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
