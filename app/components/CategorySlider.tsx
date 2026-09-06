"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";

type Category = { name: string; count: number; image: string; href: string };

export default function CategorySlider({ categories }: { categories: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const dragRef = useRef({ startX: 0, scrollLeft: 0, dragging: false, dist: 0 });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    // find active index based on center
    const center = el.scrollLeft + el.clientWidth / 2;
    const children = Array.from(el.children) as HTMLElement[];
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const d = Math.abs(center - childCenter);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setActiveIdx(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const start = () => {
      autoRef.current = setInterval(() => {
        if (dragRef.current.dragging) return;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 200, behavior: "smooth" });
        }
      }, 3000);
    };
    start();
    const pause = () => { clearInterval(autoRef.current); };
    const resume = () => { clearInterval(autoRef.current); start(); };
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    return () => {
      clearInterval(autoRef.current);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
    };
  }, []);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 250, behavior: "smooth" });
  };

  const goTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.clientWidth / 2 + child.offsetWidth / 2, behavior: "smooth" });
  };

  // Drag to scroll
  const onDown = (clientX: number) => {
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { startX: clientX, scrollLeft: el.scrollLeft, dragging: true, dist: 0 };
    el.style.scrollSnapType = "none";
  };
  const onMove = (clientX: number) => {
    if (!dragRef.current.dragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = clientX - dragRef.current.startX;
    dragRef.current.dist += Math.abs(dx - (el.scrollLeft - dragRef.current.scrollLeft + dx));
    el.scrollLeft = dragRef.current.scrollLeft - dx;
  };
  const onUp = () => {
    dragRef.current.dragging = false;
    const el = scrollRef.current;
    if (el) el.style.scrollSnapType = "";
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeSize = isMobile ? 90 : 140;
  const inactiveSize = isMobile ? 75 : 120;

  return (
    <div className="w-full flex flex-col items-center select-none" dir="rtl">
      {/* Arrows on top */}
      <div className="flex gap-2 justify-start w-full px-4 sm:px-12 mb-3">
        <button
          onClick={() => scroll(1)}
          aria-label="التالي"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(153,246,228,0.2)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            opacity: canScrollRight ? 1 : 0.3,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99f6e4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button
          onClick={() => scroll(-1)}
          aria-label="السابق"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(153,246,228,0.2)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            opacity: canScrollLeft ? 1 : 0.3,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99f6e4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      <div className="relative w-full">
        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-6 overflow-x-auto px-4 sm:px-12 py-4 sm:py-6 cursor-grab active:cursor-grabbing"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          onPointerDown={e => onDown(e.clientX)}
          onPointerMove={e => onMove(e.clientX)}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          {categories.map((cat, i) => (
            <Link
              key={`${cat.name}-${i}`}
              href={cat.href}
              onClick={e => { if (dragRef.current.dist > 8) e.preventDefault(); }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 sm:gap-2.5 group"
              style={{ scrollSnapAlign: "center" }}
            >
              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105"
                style={{
                  width: activeIdx === i ? activeSize : inactiveSize,
                  height: activeIdx === i ? activeSize : inactiveSize,
                  background: activeIdx === i
                    ? "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,253,250,0.9))"
                    : "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(240,253,250,0.7))",
                  border: activeIdx === i
                    ? "2px solid rgba(153,246,228,0.4)"
                    : "1px solid rgba(255,255,255,0.2)",
                  boxShadow: activeIdx === i
                    ? "0 8px 32px rgba(0,0,0,0.2), 0 0 20px rgba(94,234,212,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.4s ease",
                }}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    unoptimized
                    className="object-contain p-2.5 sm:p-4"
                    sizes="(max-width:640px) 90px, 140px"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">🛍️</div>
                )}
              </div>
              <div className="text-center">
                <p
                  className="font-bold leading-tight line-clamp-2 transition-colors duration-300"
                  style={{
                    fontSize: isMobile ? (activeIdx === i ? 11 : 10) : (activeIdx === i ? 14 : 12),
                    maxWidth: isMobile ? 90 : 140,
                    color: activeIdx === i ? "#ffffff" : "rgba(153,246,228,0.6)",
                  }}
                >
                  {cat.name}
                </p>
                {cat.count > 0 && (
                  <p className="mt-0.5" style={{ fontSize: isMobile ? 9 : 11, color: "rgba(153,246,228,0.5)" }}>
                    {cat.count} منتج
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-1.5 mt-2">
        {categories.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`الانتقال للقسم ${i + 1}`}
            className="rounded-full transition-all duration-500"
            style={{
              width: activeIdx === i ? 20 : 7,
              height: 7,
              background: activeIdx === i
                ? "linear-gradient(135deg, #99f6e4, #5eead4)"
                : "rgba(255,255,255,0.2)",
              boxShadow: activeIdx === i ? "0 2px 8px rgba(153,246,228,0.4)" : "none",
            }}
          />
        ))}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
