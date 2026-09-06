"use client";

import { useMemo } from "react";
import { sortProducts } from "../../../lib/sortProducts";
import { slugConfigs } from "../../../lib/categoryConfig";
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

function filterBySlug(products: Product[], slug: string): Product[] {
  const config = slugConfigs[slug];
  if (!config) return [];
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category ? p.category === category : true;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    const matchExclude = nameExcludes?.length
      ? !nameExcludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    return matchBrand && matchCategory && matchName && matchExclude;
  });
}

export default function SamsungOnlyClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const allProducts = useMemo(() =>
    sortProducts(initialProducts.filter((p) => p.brand?.toLowerCase() === "samsung")),
    [initialProducts]
  );
  const loading = false;

  const categoryImages = useMemo(() => {
    const map: Record<string, string> = {};
    samsungFilters.forEach((cat) => {
      const filtered = filterBySlug(allProducts, cat.slug);
      if (filtered.length > 0) {
        const img = filtered[0].images?.[0] || filtered[0].image;
        if (img) map[cat.slug] = resolveImg(img);
      }
    });
    return map;
  }, [allProducts]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    samsungFilters.forEach((cat) => {
      map[cat.slug] = filterBySlug(allProducts, cat.slug).length;
    });
    return map;
  }, [allProducts]);

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
