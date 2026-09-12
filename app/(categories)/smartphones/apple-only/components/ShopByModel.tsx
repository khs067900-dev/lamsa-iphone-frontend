"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaApple } from "react-icons/fa";
import { IoChevronForward, IoChevronBack, IoArrowBack } from "react-icons/io5";

interface FilterItem { slug: string; label: string; desc: string; }
interface Props {
  filters: FilterItem[];
  categoryImages: Record<string, string>;
  categoryCounts: Record<string, number>;
}

export default function ShopByModel({ filters, categoryImages, categoryCounts }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const comingSoonSlugs = new Set<string>([]);
  const iphone18Slug = "iphone-18";
  const visibleCategories = filters.filter((cat) => categoryCounts[cat.slug] > 0 || cat.slug === iphone18Slug);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalDots = Math.min(visibleCategories.length, 6);
  const dragRef = useRef({ startX: 0, scrollLeft: 0, dragging: false, moved: false });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const ratio = el.scrollLeft / (el.scrollWidth - el.clientWidth || 1);
      setActiveIndex(Math.round(ratio * (totalDots - 1)));
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [visibleCategories.length, totalDots]);

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, scrollLeft: scrollRef.current?.scrollLeft || 0, dragging: true, moved: false };
    setIsDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    if (Math.abs(e.clientX - dragRef.current.startX) > 8) dragRef.current.moved = true;
    if (scrollRef.current) scrollRef.current.scrollLeft = dragRef.current.scrollLeft - (e.clientX - dragRef.current.startX);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; setIsDragging(false); };

  if (visibleCategories.length === 0) return null;

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-md border border-[#DFC4A4]/20"
            style={{ background: "linear-gradient(135deg, #1F2C3E, #2a3d55)" }}
          >
            <FaApple size={22} style={{ color: "#DFC4A4" }} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black" style={{ color: "#1F2C3E" }}>تسوّق حسب الطراز</h2>
            <p className="text-[10px] sm:text-[12px]" style={{ color: "rgba(31,44,62,0.4)" }}>
              {visibleCategories.length} طراز متاح — اختر طرازك
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full flex items-center justify-center border border-[#1F2C3E]/10 hover:bg-[#1F2C3E] hover:text-[#DFC4A4] text-[#1F2C3E] transition-all duration-300">
            <IoChevronForward size={15} />
          </button>
          <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full flex items-center justify-center border border-[#1F2C3E]/10 hover:bg-[#1F2C3E] hover:text-[#DFC4A4] text-[#1F2C3E] transition-all duration-300">
            <IoChevronBack size={15} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      >
        {visibleCategories.map((cat) => {
          const img = categoryImages[cat.slug];

          return (
            <div
              key={cat.slug}
              draggable={false}
              className="group relative flex-shrink-0 w-[158px] sm:w-[205px] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                background: "linear-gradient(160deg, #FFFFFF 0%, #F5F0EA 100%)",
                border: "1.5px solid #EBE6E2",
                userSelect: "none",
                boxShadow: "0 2px 16px rgba(31,44,62,0.07)",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, transparent, #DFC4A4, transparent)" }}
              />

              {/* Image area */}
              <div className="relative w-full h-[148px] sm:h-[195px] overflow-hidden">
                {/* Subtle bg pattern */}
                <div
                  className="absolute inset-0"
                  style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(223,196,164,0.12) 0%, transparent 65%)" }}
                />

                {img ? (
                  <Image
                    src={img}
                    alt={cat.label}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 158px, 205px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaApple size={40} style={{ color: "rgba(31,44,62,0.08)" }} />
                  </div>
                )}

                {/* Badges */}
                {comingSoonSlugs.has(cat.slug) && (
                  <div className="absolute top-2.5 right-2.5">
                    <div
                      className="px-2 py-1 rounded-full text-[8px] font-black backdrop-blur-sm"
                      style={{ background: "rgba(31,44,62,0.6)", color: "rgba(255,255,255,0.6)" }}
                    >
                      قريباً
                    </div>
                  </div>
                )}

                {/* Bottom fade into card */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                  style={{ background: "linear-gradient(to top, #F5F0EA, transparent)" }}
                />
              </div>

              {/* Divider */}
              <div className="mx-3 h-px" style={{ background: "linear-gradient(90deg, transparent, #DFC4A4, transparent)" }} />

              {/* Info */}
              <div className="px-3 sm:px-4 py-3 sm:py-3.5">
                <p className="text-[12px] sm:text-[14px] font-black mb-0.5 truncate" style={{ color: "#1F2C3E" }}>{cat.label}</p>
                <p className="text-[9px] sm:text-[11px] mb-3 truncate" style={{ color: "rgba(31,44,62,0.45)" }}>{cat.desc}</p>

                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    if (!dragRef.current.moved) {
                      const href = cat.slug === iphone18Slug
                        ? "/smartphones/apple/iphone-18"
                        : `/smartphones/${cat.slug}`;
                      router.push(href);
                    }
                  }}
                  className="group/btn w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black transition-all duration-300 hover:gap-3 hover:shadow-md"
                  style={{ background: "linear-gradient(135deg, #1F2C3E, #2a3d55)", color: "#DFC4A4" }}
                >
                  تسوّق الآن
                  <IoArrowBack size={11} className="transition-transform duration-300 group-hover/btn:-translate-x-1" />
                </button>
              </div>

              {/* Border glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1.5px rgba(223,196,164,0.5)" }}
              />
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: totalDots }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              el.scrollTo({ left: (i / (totalDots - 1)) * (el.scrollWidth - el.clientWidth), behavior: "smooth" });
            }}
            className="rounded-full transition-all duration-300"
            style={{
              width: activeIndex === i ? 28 : 7,
              height: 7,
              background: activeIndex === i ? "linear-gradient(90deg, #DFC4A4, #c9a87c)" : "rgba(31,44,62,0.12)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
