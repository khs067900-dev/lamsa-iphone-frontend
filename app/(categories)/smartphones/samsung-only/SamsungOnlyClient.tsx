"use client";

import { useMemo } from "react";
import { sortProducts } from "../../../lib/sortProducts";
import { buildModelMeta } from "../../../lib/filterUtils";
import type { Product } from "../../../components/products/types";

import HeroSection from "./components/HeroSection";
import ShopByModel from "./components/ShopByModel";
import LatestPhones from "./components/LatestPhones";
import WhyLamsa from "./components/WhyLamsa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

const samsungFilters = [
  { slug: "samsung-s26-ultra", label: "جالكسي S26 الترا", desc: "الأحدث والأقوى" },
  { slug: "samsung-s25-ultra", label: "جالكسي S25 الترا", desc: "ذكاء اصطناعي" },
  { slug: "samsung-s24-ultra", label: "جالكسي S24 الترا", desc: "قلم مدمج" },
  { slug: "samsung-s23-ultra", label: "جالكسي S23 الترا", desc: "كاميرا 200MP" },
  { slug: "samsung-s22-ultra", label: "جالكسي S22 الترا", desc: "أداء خارق" },
];

export default function SamsungOnlyClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const allProducts = useMemo(() =>
    sortProducts(initialProducts.filter((p) => p.brand?.toLowerCase() === "samsung")),
    [initialProducts]
  );
  const loading = false;

  const { categoryImages, categoryCounts } = useMemo(
    () => buildModelMeta(allProducts, samsungFilters, resolveImg),
    [allProducts]
  );

  return (
    <main className="min-h-screen bg-[#FDFBF8]" dir="rtl">
      <HeroSection productCount={allProducts.length} loading={loading} />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-14">
        {!loading && (
          <ShopByModel
            filters={samsungFilters}
            categoryImages={categoryImages}
            categoryCounts={categoryCounts}
          />
        )}

        {!loading && allProducts.length > 0 && (
          <LatestPhones products={allProducts} />
        )}

        <WhyLamsa />
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}
