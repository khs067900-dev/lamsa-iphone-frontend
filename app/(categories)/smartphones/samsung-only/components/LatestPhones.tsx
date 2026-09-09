"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoArrowBack, IoChevronForward, IoChevronBack } from "react-icons/io5";
import type { Product } from "../../../../components/products/types";
import { filterBySlug } from "../../../../lib/filterUtils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;
const fmt = (n: number) => n.toLocaleString("en-US");

const modelSlugs = [
  { slug: "samsung-s26-ultra", label: "S26 Ultra" },
  { slug: "samsung-s25-ultra", label: "S25 Ultra" },
  { slug: "samsung-s24-ultra", label: "S24 Ultra" },
  { slug: "samsung-s23-ultra", label: "S23 Ultra" },
  { slug: "samsung-s22-ultra", label: "S22 Ultra" },
];

export default function LatestPhones({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalDots = 5;
  const dragRef = useRef({ startX: 0, scrollLeft: 0, dragging: false, moved: false });

  const picks: (Product & { modelLabel: string })[] = [];
  const usedIds = new Set<string>();

  for (const model of modelSlugs) {
    const filtered = filterBySlug(products, model.slug);
    for (const found of filtered) {
      if (!usedIds.has(found._id)) {
        usedIds.add(found._id);
        picks.push({ ...found, modelLabel: model.label });
        break;
      }
    }
  }

  if (picks.length === 0 && products.length > 0) {
    products.slice(0, 6).forEach((p, i) => {
      picks.push({ ...p, modelLabel: `Galaxy ${i + 1}` });
    });
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollRatio = el.scrollLeft / (el.scrollWidth - el.clientWidth || 1);
      setActiveIndex(Math.round(scrollRatio * (totalDots - 1)));
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [picks.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -230 : 230, behavior: "smooth" });
  };

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#BC9255" }} />
          <h2 className="text-lg sm:text-xl font-black text-[#0A1825]">أحدث المنتجات</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full flex items-center justify-center border border-[#BC9255]/20 hover:bg-[#BC9255]/10 text-[#BC9255] transition-all duration-300">
            <IoChevronForward size={14} />
          </button>
          <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full flex items-center justify-center border border-[#BC9255]/20 hover:bg-[#BC9255]/10 text-[#BC9255] transition-all duration-300">
            <IoChevronBack size={14} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      >
        {picks.map((p) => {
          const img = p.images?.[0] || p.image;
          const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.originalPrice || p.price || 0;
          return (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              onClick={(e) => { if (dragRef.current.moved) e.preventDefault(); }}
              draggable={false}
              className="group flex-shrink-0 block w-[155px] sm:w-[215px] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-[#EBE6E2] hover:border-[#BC9255]/40"
              style={{ background: "linear-gradient(180deg, #FFFFFF 60%, #F9F6F2 100%)", userSelect: "none" }}
            >
                <div className="relative h-[155px] sm:h-[215px] overflow-hidden">
                  {img && (
                    <Image src={resolveImg(img)} alt={p.name} fill className="object-contain p-4 sm:p-6 transition-all duration-500 group-hover:scale-105" sizes="(max-width: 640px) 155px, 215px" />
                  )}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-bold bg-[#BC9255]/10 text-[#BC9255] border border-[#BC9255]/20">
                    {p.modelLabel}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 to-transparent" />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-[10px] sm:text-[12px] font-bold line-clamp-2 leading-relaxed mb-2 sm:mb-3 text-[#0A1825]">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] sm:text-[14px] font-black text-[#0A1825]">{fmt(price)} <span className="text-[9px] sm:text-[10px] font-medium text-[#0A1825]/40">ر.س</span></p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: "#BC9255" }}>
                      <IoArrowBack size={12} className="text-white" />
                    </div>
                  </div>
                </div>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center gap-1.5 mt-5">
        {Array.from({ length: totalDots }).map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{ width: activeIndex === i ? 22 : 6, height: 6, backgroundColor: activeIndex === i ? "#BC9255" : "#EBE6E2" }} />
        ))}
      </div>
    </section>
  );
}
