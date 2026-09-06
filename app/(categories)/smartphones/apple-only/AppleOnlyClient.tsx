"use client";

import { useMemo } from "react";
import { sortProducts } from "../../../lib/sortProducts";
import { slugConfigs } from "../../../lib/categoryConfig";
import type { Product } from "../../../components/products/types";

import HeroSection from "./components/HeroSection";
import ShopByModel from "./components/ShopByModel";
import LatestPhones from "./components/LatestPhones";
import WhyLamsa from "./components/WhyLamsa";
import MoreAppleProducts from "./components/MoreAppleProducts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

const appleFilters = [
  { slug: "iphone-17-pro-max", label: "آيفون 17 برو ماكس", desc: "الأقوى والأكبر" },
  { slug: "iphone-17-pro", label: "آيفون 17 برو", desc: "أداء احترافي" },
  { slug: "iphone-17", label: "آيفون 17 عادي", desc: "الجيل الجديد" },
  { slug: "iphone-17-air", label: "آيفون 17 Air", desc: "خفيف كالهواء" },
  { slug: "iphone-16-pro-max", label: "آيفون 16 برو ماكس", desc: "قوة لا تُضاهى" },
  { slug: "iphone-16-pro", label: "آيفون 16 برو", desc: "تصوير احترافي" },
  { slug: "iphone-16-plus", label: "آيفون 16 بلس", desc: "شاشة أكبر" },
  { slug: "iphone-16", label: "آيفون 16 عادي", desc: "ذكاء متقدم" },
  { slug: "iphone-15-pro-max", label: "آيفون 15 برو ماكس", desc: "تيتانيوم فاخر" },
  { slug: "iphone-15-pro", label: "آيفون 15 برو", desc: "خفيف وقوي" },
  { slug: "iphone-15-plus", label: "آيفون 15 بلس", desc: "بطارية تدوم" },
  { slug: "iphone-15", label: "آيفون 15 عادي", desc: "تصميم عصري" },
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

export default function AppleOnlyClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const applePhones = useMemo(() =>
    sortProducts(
      initialProducts.filter(
        (p) =>
          p.brand?.toLowerCase() === "apple" &&
          (p.name?.toLowerCase().includes("iphone") ||
            p.name?.includes("ايفون") ||
            p.name?.includes("آيفون") ||
            p.category?.includes("ايفون") ||
            p.category?.toLowerCase().includes("iphone"))
      )
    ),
    [initialProducts]
  );
  const allProducts = applePhones;
  const loading = false;

  const categoryImages = useMemo(() => {
    const map: Record<string, string> = {};
    appleFilters.forEach((cat) => {
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
    appleFilters.forEach((cat) => {
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
            filters={appleFilters}
            activeFilter={null}
            categoryImages={categoryImages}
            categoryCounts={categoryCounts}
            onFilterClick={() => {}}
            displayCount={allProducts.length}
          />
        )}

        {!loading && allProducts.length > 0 && (
          <LatestPhones products={allProducts} />
        )}

        <WhyLamsa />

        <MoreAppleProducts />
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}
