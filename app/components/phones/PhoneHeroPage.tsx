"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoHomeOutline, IoChevronBack, IoArrowForward, IoArrowBack, IoBatteryFullOutline, IoCameraOutline, IoColorPaletteOutline, IoServerOutline, IoSwapVerticalOutline, IoCloseCircle, IoPhonePortraitOutline } from "react-icons/io5";
import { HiOutlineCpuChip } from "react-icons/hi2";
import ProductCard from "../products/ProductCard";
import type { Product } from "../products/types";
import { slugConfigs } from "../../lib/categoryConfig";
import { sortProducts } from "../../lib/sortProducts";

const ITEMS_PER_PAGE = 12;

function normalizeArabic(str: string): string {
  return str
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

function filterProducts(products: Product[], slug: string): Product[] {
  if (!Array.isArray(products)) return [];
  const config = slugConfigs[slug];
  if (!config) return products;
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category
      ? category.includes(",")
        ? category.split(",").some((c) => normalizeArabic(p.category || "").includes(normalizeArabic(c.trim())))
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

export interface PhoneHeroPageProps {
  slug: string;
  heroImage: string;
  nameEn: string;
  nameEnLine2?: string;
  tagline: string;
  description: string;
  features?: { icon: "battery" | "camera" | "chip" | "display" | "design"; label: string }[];
  initialProducts?: Product[];
}

const iconMap = {
  battery: IoBatteryFullOutline,
  camera: IoCameraOutline,
  chip: HiOutlineCpuChip,
  display: IoPhonePortraitOutline,
  design: IoColorPaletteOutline,
};

const defaultFeatures: { icon: "battery" | "camera" | "chip" | "display" | "design"; label: string }[] = [
  { icon: "battery", label: "بطارية تدوم طول اليوم" },
  { icon: "camera", label: "نظام كاميرات احترافي" },
  { icon: "chip", label: "معالج فائق السرعة" },
];

export default function PhoneHeroPage({ slug, heroImage, nameEn, nameEnLine2, tagline, description, features = defaultFeatures, initialProducts = [] }: PhoneHeroPageProps) {
  const config = slugConfigs[slug];
  const [page, setPage] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  const products = useMemo(() => sortProducts(filterProducts(initialProducts, slug)), [initialProducts, slug]);

  const availableColors = useMemo(() => [...new Set(products.map((p) => p.color).filter(Boolean))], [products]);
  const availableStorages = useMemo(() => [...new Set(products.map((p) => p.storage).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedColor) result = result.filter((p) => p.color === selectedColor);
    if (selectedStorage) result = result.filter((p) => p.storage === selectedStorage);
    if (sortBy === "price-asc") result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    else if (sortBy === "price-desc") result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    return result;
  }, [products, selectedColor, selectedStorage, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const hasFilters = selectedColor || selectedStorage || sortBy !== "default";

  const clearFilters = () => {
    setSelectedColor(null);
    setSelectedStorage(null);
    setSortBy("default");
    setPage(1);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }} dir="rtl">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] min-h-[280px] sm:min-h-[360px] max-h-[550px] overflow-hidden">
        <Image
          src={heroImage}
          alt={nameEn}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-8 flex flex-col justify-between">
          <nav className="pt-4 sm:pt-5 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#3D2B1A]">
            <Link href="/" className="hover:text-[#1F2C3E] transition flex items-center gap-0.5 sm:gap-1">
              <IoHomeOutline size={12} />
              الرئيسية
            </Link>
            <IoChevronBack size={10} />
            <span className="text-[#3D2B1A]">{config?.parentLabel || "الهواتف"}</span>
            <IoChevronBack size={10} />
            <span className="text-[#1F2C3E] font-semibold truncate max-w-[100px] sm:max-w-none">{config?.label}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="pb-6 sm:pb-10 md:pb-14"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-[#1F2C3E] leading-tight mb-2 sm:mb-3">
              {nameEn}
              {nameEnLine2 && <><br />{nameEnLine2}</>}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-[#5C3A1E] mb-2 sm:mb-4">
              {tagline}
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[#3D2B1A]/80 max-w-xs sm:max-w-lg leading-relaxed mb-4 sm:mb-6">
              {description}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {features.map((feat, i) => {
                const Icon = iconMap[feat.icon];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full backdrop-blur-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(31,44,62,0.15)" }}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" color="#5C3A1E" />
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#1F2C3E]">{feat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ PRODUCTS ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#BC9255" }} />
            <h2 className="text-lg sm:text-xl font-bold text-[#1F2C3E]">المنتجات المتوفرة</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "#F5EBE0", color: "#A77D4B" }}>
                {filteredProducts.length} منتج
              </span>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-80" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
              <IoCloseCircle size={14} />
              مسح الفلاتر
            </button>
          )}
        </div>

        {products.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-2xl" style={{ backgroundColor: "#FFF", border: "1px solid #EBE6E2" }}>
            {availableColors.length > 1 && (
              <div className="flex items-center gap-2">
                <IoColorPaletteOutline size={16} color="#A77D4B" />
                <div className="flex flex-wrap gap-1.5">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => { setSelectedColor(selectedColor === color ? null : color!); setPage(1); }}
                      className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                      style={{
                        backgroundColor: selectedColor === color ? "#A77D4B" : "#F5EBE0",
                        color: selectedColor === color ? "#FFF" : "#5C3A1E",
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableColors.length > 1 && availableStorages.length > 1 && (
              <div className="w-px h-6 mx-1" style={{ backgroundColor: "#EBE6E2" }} />
            )}

            {availableStorages.length > 1 && (
              <div className="flex items-center gap-2">
                <IoServerOutline size={16} color="#A77D4B" />
                <div className="flex flex-wrap gap-1.5">
                  {availableStorages.map((storage) => (
                    <button
                      key={storage}
                      onClick={() => { setSelectedStorage(selectedStorage === storage ? null : storage!); setPage(1); }}
                      className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                      style={{
                        backgroundColor: selectedStorage === storage ? "#A77D4B" : "#F5EBE0",
                        color: selectedStorage === storage ? "#FFF" : "#5C3A1E",
                      }}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(availableColors.length > 1 || availableStorages.length > 1) && (
              <div className="w-px h-6 mx-1" style={{ backgroundColor: "#EBE6E2" }} />
            )}

            <div className="flex items-center gap-2">
              <IoSwapVerticalOutline size={16} color="#A77D4B" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
                className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full outline-none cursor-pointer appearance-none"
                style={{ backgroundColor: "#F5EBE0", color: "#5C3A1E", border: "none" }}
              >
                <option value="default">ترتيب افتراضي</option>
                <option value="price-asc">السعر: الأقل أولاً</option>
                <option value="price-desc">السعر: الأعلى أولاً</option>
              </select>
            </div>
          </div>
        )}

        {!products.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: "#F5EBE0" }}>
              📱
            </div>
            <p className="text-[#1F2C3E] text-lg font-bold">المنتجات ستُضاف قريباً</p>
            <Link href="/" className="text-sm font-bold flex items-center gap-1.5 px-5 py-2 rounded-full transition" style={{ color: "#A77D4B", backgroundColor: "#F5EBE0" }}>
              <IoArrowForward size={14} />
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              <AnimatePresence mode="wait">
                {filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border-2 disabled:opacity-30 transition-all"
                  style={{ borderColor: "#DFC4A4", color: "#1F2C3E" }}
                >
                  <IoArrowForward size={14} />
                  السابق
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => { setPage(n); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                    className="w-10 h-10 rounded-full text-sm font-bold transition-all"
                    style={{
                      backgroundColor: page === n ? "#A77D4B" : "transparent",
                      color: page === n ? "#fff" : "#1F2C3E",
                      border: page === n ? "none" : "2px solid #DFC4A4",
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border-2 disabled:opacity-30 transition-all"
                  style={{ borderColor: "#DFC4A4", color: "#1F2C3E" }}
                >
                  التالي
                  <IoArrowBack size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
