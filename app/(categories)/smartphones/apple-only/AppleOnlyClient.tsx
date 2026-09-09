"use client";

import { useMemo } from "react";
import { sortProducts } from "../../../lib/sortProducts";
import { buildModelMeta } from "../../../lib/filterUtils";
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

  const { categoryImages, categoryCounts } = useMemo(
    () => buildModelMeta(allProducts, appleFilters, resolveImg),
    [allProducts]
  );

  return (
    <main className="min-h-screen bg-[#FDFBF8]" dir="rtl">
      <HeroSection productCount={allProducts.length} loading={loading} />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-14">
        {!loading && (
          <ShopByModel
            filters={appleFilters}
            categoryImages={categoryImages}
            categoryCounts={categoryCounts}
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
