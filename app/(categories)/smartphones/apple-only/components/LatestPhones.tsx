"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { FaApple } from "react-icons/fa";
import type { Product } from "../../../../components/products/types";
import { filterBySlug } from "../../../../lib/filterUtils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;
const fmt = (n: number) => n.toLocaleString("en-US");

const modelSlugs = [
  { slug: "iphone-17-pro-max", label: "17 Pro Max" },
  { slug: "iphone-17-pro", label: "17 Pro" },
  { slug: "iphone-17-air", label: "17 Air" },
  { slug: "iphone-17", label: "17" },
  { slug: "iphone-16-pro-max", label: "16 Pro Max" },
  { slug: "iphone-16-pro", label: "16 Pro" },
  { slug: "iphone-16", label: "16" },
  { slug: "iphone-15-pro-max", label: "15 Pro Max" },
  { slug: "iphone-15-pro", label: "15 Pro" },
  { slug: "iphone-15", label: "15" },
];

export default function LatestPhones({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalDots = 5;
  const dragRef = useRef({ startX: 0, scrollLeft: 0, dragging: false, moved: false });

  const picks: (Product & { modelLabel: string })[] = [];
  const usedIds = new Set<string>();
  for (const model of modelSlugs) {
    const found = filterBySlug(products, model.slug).find((p) => !usedIds.has(p._id));
    if (found) { usedIds.add(found._id); picks.push({ ...found, modelLabel: model.label }); }
  }
  if (picks.length === 0) products.slice(0, 6).forEach((p, i) => picks.push({ ...p, modelLabel: `iPhone ${i + 1}` }));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const ratio = el.scrollLeft / (el.scrollWidth - el.clientWidth || 1);
      setActiveIndex(Math.round(ratio * (totalDots - 1)));
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [picks.length]);

  const scroll = (dir: "left" | "right") => scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, scrollLeft: scrollRef.current?.scrollLeft || 0, dragging: true, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    if (Math.abs(e.clientX - dragRef.current.startX) > 5) dragRef.current.moved = true;
    if (scrollRef.current) scrollRef.current.scrollLeft = dragRef.current.scrollLeft - (e.clientX - dragRef.current.startX);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  if (picks.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#DFC4A4" }} />
          <div>
            <h2 className="text-base sm:text-lg font-black" style={{ color: "#1F2C3E" }}>أحدث المنتجات</h2>
            <p className="text-[10px] sm:text-[11px]" style={{ color: "rgba(31,44,62,0.4)" }}>اختر طرازك المفضل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full flex items-center justify-center border border-[#1F2C3E]/10 hover:bg-[#1F2C3E] hover:text-[#DFC4A4] text-[#1F2C3E] transition-all duration-300">
            <IoChevronForward size={14} />
          </button>
          <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full flex items-center justify-center border border-[#1F2C3E]/10 hover:bg-[#1F2C3E] hover:text-[#DFC4A4] text-[#1F2C3E] transition-all duration-300">
            <IoChevronBack size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      >
        {picks.map((p) => {
          const img = p.images?.[0] || p.image;
          const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.originalPrice || p.price || 0;
          const hasDiscount = p.salePrice && p.salePrice > 0 && p.originalPrice && p.originalPrice > p.salePrice;
          return (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              onClick={(e) => { if (dragRef.current.moved) e.preventDefault(); }}
              draggable={false}
              className="group flex-shrink-0 block w-[158px] sm:w-[220px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EBE6E2] hover:border-[#DFC4A4]/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              style={{ background: "linear-gradient(180deg, #FFFFFF 55%, #F8F5F1 100%)", userSelect: "none" }}
            >
              {/* Image */}
              <div className="relative h-[158px] sm:h-[220px] overflow-hidden">
                {img && (
                  <Image src={resolveImg(img)} alt={p.name} fill className="object-contain p-4 sm:p-6 transition-all duration-500 group-hover:scale-105" sizes="(max-width: 640px) 158px, 220px" />
                )}
                {/* Model badge */}
                <div className="absolute top-2.5 right-2.5 px-2 sm:px-2.5 py-1 rounded-lg text-[8px] sm:text-[9px] font-black backdrop-blur-sm" style={{ background: "rgba(31,44,62,0.88)", color: "#DFC4A4" }}>
                  {p.modelLabel}
                </div>
                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg text-[8px] font-black" style={{ background: "linear-gradient(135deg, #e74c3c, #c0392b)", color: "#fff" }}>
                    خصم
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/70 to-transparent" />
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 40%, rgba(223,196,164,0.1), transparent 65%)" }} />
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4 border-t border-[#EBE6E2]/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FaApple size={9} style={{ color: "#1F2C3E", opacity: 0.4 }} />
                  <p className="text-[9px] sm:text-[10px] font-medium" style={{ color: "rgba(31,44,62,0.4)" }}>iPhone {p.modelLabel}</p>
                </div>
                <h3 className="text-[10px] sm:text-[12px] font-bold line-clamp-2 leading-relaxed mb-2.5 sm:mb-3" style={{ color: "#1F2C3E" }}>{p.name}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] sm:text-[15px] font-black" style={{ color: "#1F2C3E" }}>
                      {fmt(price)} <span className="text-[9px] sm:text-[10px] font-medium" style={{ color: "rgba(31,44,62,0.45)" }}>ر.س</span>
                    </p>
                    {hasDiscount && (
                      <p className="text-[9px] line-through" style={{ color: "rgba(31,44,62,0.35)" }}>{fmt(p.originalPrice!)}</p>
                    )}
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md" style={{ background: "linear-gradient(135deg, #1F2C3E, #2a3d55)" }}>
                    <IoChevronBack size={13} style={{ color: "#DFC4A4" }} />
                  </div>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, #DFC4A4, transparent)" }} />
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center gap-1.5 mt-5">
        {Array.from({ length: totalDots }).map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{ width: activeIndex === i ? 24 : 6, height: 6, backgroundColor: activeIndex === i ? "#DFC4A4" : "#E5E0DB" }} />
        ))}
      </div>
    </section>
  );
}
