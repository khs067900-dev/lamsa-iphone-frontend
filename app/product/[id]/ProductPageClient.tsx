"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoArrowForward, IoShareSocial, IoHomeOutline, IoChevronBack } from "react-icons/io5";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "../../components/products/types";
import { useCartStore } from "../../store/cartStore";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductDetails from "./components/ProductDetails";
import ProductSections from "./components/ProductSections";
import { isIPhone18PreOrder } from "../../lib/usePreOrderAvailability";
import PreOrderModal from "../../components/pre-order/PreOrderModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

const toKey = (o: { storage: string; ram?: string; size?: string }) =>
  `${o.storage}|${o.ram ?? ""}|${o.size ?? ""}`;

export default function ProductPageClient({ id, initialProduct }: { id: string; initialProduct?: Product | null }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const firstVariant = product?.variants?.[0];
  const [selectedColor, setSelectedColor] = useState<string>(() => firstVariant?.color ?? product?.color ?? "");
  const [selectedStorage, setSelectedStorage] = useState<string>(() => {
    const defStorage = firstVariant?.defaultStorage;
    const defOpt = firstVariant?.storageOptions?.find((o) => o.storage === defStorage) ?? firstVariant?.storageOptions?.[0];
    return defOpt ? toKey(defOpt) : product?.storage ?? "";
  });
  const [addedToCart, setAddedToCart] = useState(false);
  const [preOrderOpen, setPreOrderOpen] = useState(false);

  useEffect(() => {
    if (initialProduct || product) return;
    const safeId = /^[a-zA-Z0-9_-]{1,64}$/.test(id) ? id : null;
    if (!safeId) { setFetchFailed(true); return; }
    setLoading(true);
    fetch(`${API}/api/products/${safeId}`)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(setProduct)
      .catch(() => setFetchFailed(true))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialProduct]);

  if (loading)
    return (
      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f0e8" }}>
        <div className="h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#BC9255", borderTopColor: "transparent" }} />
            <p className="text-sm font-medium" style={{ color: "#A77D4B" }}>جاري التحميل...</p>
          </div>
        </div>
      </main>
    );

  if (fetchFailed || !product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#f5f0e8" }}>
        <p className="text-gray-400 text-lg">المنتج غير موجود</p>
        <button onClick={() => router.back()} className="text-sm font-bold px-6 py-3 rounded-full text-white" style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)" }}>العودة</button>
      </div>
    );

  const activeVariant = product.variants?.find((v) => v.color === selectedColor);
  const activeStorageOptions = activeVariant?.storageOptions ?? product.variants?.[0]?.storageOptions ?? [];
  const activeStorage = activeStorageOptions.find((s) => toKey(s) === selectedStorage) ?? activeStorageOptions[0];

  const merged = activeVariant?.images?.length
    ? activeVariant.images
    : [...(product.images ?? []), ...(product.image ? [product.image] : [])];
  const allImages = [...new Set(merged)].filter(Boolean).map(resolveImg).filter((src) => {
    try { new URL(src); return true; } catch { return false; }
  });

  const originalPrice = activeStorage?.originalPrice ?? product.originalPrice ?? 0;
  const salePrice = activeStorage?.salePrice ?? product.salePrice;

  const resolvedStorage = activeStorage?.storage || selectedStorage.split("|")[0] || product.storage;

  // Use the variant's own name if available, otherwise fall back to the root product name
  const displayName = activeVariant?.name ?? product.name;

  const displayProduct: Product = {
    ...product,
    name: displayName,
    color: selectedColor || product.color,
    storage: resolvedStorage,
    originalPrice,
    salePrice,
    image: activeVariant?.images?.[0] ?? product.image,
    images: activeVariant?.images?.length ? activeVariant.images : product.images,
  };

  const handleShare = async () => {
    try { await navigator.share({ title: product.name, url: window.location.href }); } catch {}
  };

  const handleAddToCart = () => {
    addItem(displayProduct);
    setAddedToCart(true);
  };

  const isPreOrder = isIPhone18PreOrder(product.name);

  return (
    <>
      <style>{`
        @keyframes floatUp { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        .anim-float { animation: floatUp 0.7s cubic-bezier(.22,1,.36,1) both }
        .anim-fade  { animation: fadeIn  0.5s ease both }
        .scrollbar-hide::-webkit-scrollbar { display:none }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none }
      `}</style>

      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f0e8" }}>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          {/* ── Back + Breadcrumb + Share ── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all"
                style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B" }}
              >
                <IoArrowForward size={18} />
              </button>
              <nav className="hidden sm:flex items-center gap-1.5 text-[11px]" style={{ color: "#A77D4B" }}>
                <Link href="/" className="hover:text-[#BC9255] transition flex items-center gap-1">
                  <IoHomeOutline size={12} /> الرئيسية
                </Link>
                <IoChevronBack size={10} className="opacity-40" />
                {product.category && (
                  <>
                    <span className="opacity-60">{product.category}</span>
                    <IoChevronBack size={10} className="opacity-40" />
                  </>
                )}
                <span className="font-semibold truncate max-w-[200px]" style={{ color: "#1F2C3E" }}>{product.name}</span>
              </nav>
            </div>
            <button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all"
              style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#A77D4B" }}
            >
              <IoShareSocial size={17} />
            </button>
          </div>

          {/* Product card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

            {/* Images */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white rounded-3xl p-4 shadow-xl" style={{ border: "1px solid #EBE6E2" }}>
                <ProductImages images={allImages} name={product.name} discountPercent={displayProduct.discountPercent} />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Product name (desktop) */}
              <h2 className="hidden lg:block text-2xl xl:text-3xl font-black mb-5 leading-snug" style={{ color: "#1F2C3E" }}>{displayName}</h2>

              <ProductInfo
                product={displayProduct}
                selectedColor={selectedColor}
                selectedStorage={selectedStorage}
                addedToCart={addedToCart}
                onColorChange={(c) => {
                  setSelectedColor(c);
                  const newVariant = product.variants?.find((v) => v.color === c);
                  const opts = newVariant?.storageOptions ?? [];
                  const def = newVariant?.defaultStorage;
                  const defOpt = opts.find((o) => o.storage === def) ?? opts[0];
                  if (defOpt) setSelectedStorage(toKey(defOpt));
                }}
                onStorageChange={(s) => setSelectedStorage(s)}
                onAddToCart={handleAddToCart}
                onPreOrder={isPreOrder ? () => setPreOrderOpen(true) : undefined}
              />
            </motion.div>
          </div>

          {/* Details & Sections */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {!/ايفون 18|iphone 18/i.test(product.category ?? "") && (
              <ProductDetails
                installment={product.installment}
                description={product.description}
                specs={product.specs}
                specGroups={product.specGroups}
              />
            )}
            <ProductSections sections={product.sections} />
          </motion.div>
        </div>

        <div className="h-10" />
      </main>

      {isPreOrder && (
        <PreOrderModal
          open={preOrderOpen}
          onClose={() => setPreOrderOpen(false)}
          product={{
            _id: product._id,
            name: displayName,
            image: product.image,
            variants: product.variants,
            price: originalPrice,
          }}
        />
      )}
    </>
  );
}
