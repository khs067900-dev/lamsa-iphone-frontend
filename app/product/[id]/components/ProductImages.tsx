"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { IoChevronBack, IoChevronForward, IoExpand } from "react-icons/io5";

interface ProductImagesProps {
  images: string[];
  name: string;
  discountPercent?: number;
}

export default function ProductImages({ images, name, discountPercent = 0 }: ProductImagesProps) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const touchStart = useRef(0);

  const goTo = (i: number) => setSelected((i + images.length) % images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4">
      {/* Main Image Card */}
      <div className="relative bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] overflow-hidden shadow-lg sm:shadow-xl shadow-black/[.04]" style={{ border: "1px solid #EBE6E2" }}>
        <div
          className="relative aspect-[4/3.5] sm:aspect-[4/3] overflow-hidden cursor-zoom-in group"
          onClick={() => setZoomed(!zoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomed(false)}
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStart.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50 && images.length > 1) goTo(selected + (diff > 0 ? 1 : -1));
          }}
        >
          {/* Discount badge */}
          {discountPercent > 0 && (
            <div className="absolute z-10 top-2.5 right-2.5 sm:top-4 sm:right-4 md:top-5 md:right-5">
              <div className="text-[10px] sm:text-[11px] md:text-xs font-extrabold px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-md flex items-center gap-1 sm:gap-1.5" style={{ backgroundColor: "#BC9255", color: "#fff" }}>
                <span className="opacity-90">خصم</span>
                <span className="text-xs sm:text-sm font-black">{discountPercent}%</span>
              </div>
            </div>
          )}

          {/* Zoom hint */}
          <div className="absolute z-10 bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-5 md:right-5 items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex" style={{ backgroundColor: "rgba(245,240,232,0.9)", color: "#A77D4B", backdropFilter: "blur(8px)" }}>
            <IoExpand size={12} className="sm:hidden" />
            <IoExpand size={13} className="hidden sm:block" />
            اضغط للتكبير
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute z-10 top-2.5 left-2.5 sm:top-4 sm:left-4 md:top-5 md:left-5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-bold" style={{ backgroundColor: "rgba(245,240,232,0.9)", color: "#A77D4B", backdropFilter: "blur(8px)" }}>
              {selected + 1} / {images.length}
            </div>
          )}

          {images.length > 0 ? (
            <Image
              src={images[selected]}
              alt={name}
              fill
              className="object-contain p-3 sm:p-5 md:p-8 lg:p-10 transition-all duration-500 ease-out"
              style={
                zoomed
                  ? { transform: "scale(2.2)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : {}
              }
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 58vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl sm:text-6xl">📱</div>
          )}

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(selected - 1); }}
                className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hidden sm:flex hover:shadow-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "#A77D4B", border: "1px solid #EBE6E2" }}
              >
                <IoChevronForward size={16} className="md:hidden" />
                <IoChevronForward size={18} className="hidden md:block" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(selected + 1); }}
                className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hidden sm:flex hover:shadow-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "#A77D4B", border: "1px solid #EBE6E2" }}
              >
                <IoChevronBack size={16} className="md:hidden" />
                <IoChevronBack size={18} className="hidden md:block" />
              </button>
            </>
          )}

          {/* Dots (mobile only) */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full sm:hidden shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === selected ? "16px" : "6px",
                    height: "6px",
                    backgroundColor: i === selected ? "#BC9255" : "#DFC4A4",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-2.5 md:gap-3 overflow-x-auto scrollbar-hide justify-start sm:justify-center px-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-14 h-14 sm:w-[68px] sm:h-[68px] md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 transition-all duration-300 bg-white ${
                i === selected ? "scale-105" : "opacity-50 hover:opacity-90 hover:shadow-md"
              }`}
              style={{
                border: i === selected ? "2.5px solid #BC9255" : "1px solid #EBE6E2",
                boxShadow: i === selected ? "0 4px 16px rgba(188,146,85,0.2)" : "none",
                outline: i === selected ? "3px solid rgba(188,146,85,0.12)" : "none",
                outlineOffset: "2px",
              }}
            >
              <Image src={img} alt="" fill className="object-contain p-1.5 sm:p-2 md:p-2.5" sizes="(max-width: 640px) 56px, (max-width: 768px) 68px, 80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
