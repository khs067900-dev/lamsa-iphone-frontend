"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImagesProps {
  images: string[];
  name: string;
  discountPercent?: number;
}

export default function ProductImages({ images, name, discountPercent = 0 }: ProductImagesProps) {
  const [selected, setSelected] = useState(0);
  const touchStart = useRef(0);

  const goTo = (i: number) => setSelected((i + images.length) % images.length);

  return (
    <div className="flex flex-col gap-4">

      {/* Main Image */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{ aspectRatio: "1/1", background: "#fafaf9" }}
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40 && images.length > 1) goTo(selected + (diff > 0 ? 1 : -1));
        }}
      >
        {/* subtle corner accent */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-br-full opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle at top left, #f0e8d8, transparent)" }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle at bottom right, #f0e8d8, transparent)" }} />

        {discountPercent > 0 && (
          <div className="absolute top-4 right-4 z-20">
            <span className="text-[11px] font-black px-3 py-1.5 rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)", boxShadow: "0 4px 12px rgba(188,146,85,0.4)" }}>
              خصم {discountPercent}%
            </span>
          </div>
        )}

        {/* counter top left */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 z-20 text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(31,44,62,0.07)", color: "#A77D4B" }}>
            {selected + 1} / {images.length}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {images[selected] && (
              <Image
                src={images[selected]}
                alt={name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-0.5 pb-0.5">
          {images.map((img, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelected(i)}
              className="relative shrink-0 rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                width: 68,
                height: 68,
                background: i === selected ? "#fff" : "#fafaf9",
                border: i === selected ? "2px solid #BC9255" : "2px solid #ede8e0",
                boxShadow: i === selected ? "0 4px 16px rgba(188,146,85,0.2)" : "none",
                opacity: i === selected ? 1 : 0.6,
              }}
            >
              <Image src={img} alt="" fill className="object-contain p-2" sizes="68px" />
              {i === selected && (
                <motion.div
                  layoutId="thumb-indicator"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: "#BC9255" }}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
