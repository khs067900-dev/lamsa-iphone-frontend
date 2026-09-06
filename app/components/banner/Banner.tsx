"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  {
    image: "/hero1.webp",
    tag: "أحدث الأجهزة",
    title: "أداء يفوق التوقعات",
    titleHighlight: "بتقنية لا تُلمس",
    description: "اكتشف أحدث الإصدارات من الهواتف الذكية بأفضل الأسعار وضمان موثوق",
    buttons: [
      { text: "تسوّق الآن", filled: true, href: "#products" },
      { text: "اكتشف الأجهزة", filled: false, href: "#products" },
    ],
  },
  {
    image: "/hero2.webp",
    tag: "عالم Apple",
    title: "كل ما تحتاجه",
    titleHighlight: "من عالم Apple",
    description: "اكتشف مجموعة واسعة من أجهزة آيفون، الملحقات الأصلية، الساعات والسماعات بأفضل الأسعار",
    buttons: [{ text: "اكتشف المنتجات", filled: true, href: "/smartphones/apple-only" }],
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative w-full min-h-[40vh] sm:min-h-[55vh] md:min-h-[85vh] flex items-center overflow-hidden" style={{ backgroundColor: "#0A1825" }}>
      {/* Background Images - CSS transitions instead of framer-motion */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt={s.tag}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
            quality={75}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-14 md:py-16">
        <div
          className="max-w-2xl text-right"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          <span
            className="inline-block font-bold text-xs sm:text-sm md:text-base tracking-widest uppercase mb-3 sm:mb-4 border-b-2 pb-1"
            style={{ color: "#BC9255", borderColor: "#BC9255" }}
          >
            {slide.tag}
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-5 leading-tight text-[#0A1825]">
            {slide.title}
            <br />
            <span style={{ color: "#BC9255" }}>{slide.titleHighlight}</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg font-semibold sm:font-normal text-[#0A1825]/80 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
            {slide.description}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12">
            {slide.buttons.map((btn) => (
              <a
                key={btn.text}
                href={btn.href || "#products"}
                className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-lg font-bold transition-transform duration-200 hover:scale-105 active:scale-95 ${
                  btn.filled ? "" : "border-2"
                }`}
                style={
                  btn.filled
                    ? { backgroundColor: "#BC9255", color: "#0A1825" }
                    : { borderColor: "#BC9255", color: "#BC9255" }
                }
              >
                {btn.text}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`الانتقال للشريحة ${i + 1}`}
            className="h-2 rounded-full transition-all duration-400"
            style={{
              width: i === current ? 24 : 8,
              backgroundColor: i === current ? "#BC9255" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
