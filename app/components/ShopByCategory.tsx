"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { FaApple } from "react-icons/fa";

const categories = [
  { name: "iPhone", icon: <FaApple className="w-4 h-4" />, desc: "أكثر من مجرد هاتف", image: "/iphone.webp", href: "/smartphones/apple-only" },
  { name: "Samsung", icon: null, desc: "تقنية بلا حدود", image: "/samsong.webp", href: "/smartphones/samsung-only" },
  { name: "Apple Watch", icon: <FaApple className="w-4 h-4" />, desc: "ساعتك الذكية", image: "/watch.webp", href: "/apple-watches/se" },
  { name: "AirPods", icon: <FaApple className="w-4 h-4" />, desc: "صوت نقي بلا حدود", image: "/air-pod.webp", href: "/audio" },
  { name: "MacBook Air", icon: <FaApple className="w-4 h-4" />, desc: "خفيف. قوي. جاهز لكل شيء.", image: "/mac.webp", href: "/laptops/macbook-air" },
  { name: "الاكسسوارات", icon: null, desc: "كل ما تحتاجه", image: "/acc.webp", href: "/accessories" },
  { name: "الصوتيات", icon: null, desc: "تجربة صوت مذهلة", image: "/audio.webp", href: "/audio" },
];

export default function ShopByCategory() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const speedRef = useRef(0.3);

  // Auto-scroll animation (RTL: scrollLeft goes negative)
  useEffect(() => {
    const animate = () => {
      const el = scrollRef.current;
      if (el && !isPaused && !isDragging) {
        el.scrollLeft -= speedRef.current;
        // Reset for infinite loop: when scrolled halfway, jump back
        if (Math.abs(el.scrollLeft) >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused, isDragging]);

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
    scrollRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    scrollRef.current?.releasePointerCapture(e.pointerId);
  };

  // Duplicate categories for seamless loop
  const items = [...categories, ...categories];

  return (
    <section className="w-full py-10 sm:py-16 overflow-hidden" dir="rtl" style={{ background: "linear-gradient(to bottom, #ffffff, #f5f0e8)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sm:mb-12 px-4 sm:px-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="text-right">
          <span
            className="inline-block font-bold text-[10px] sm:text-xs md:text-sm tracking-widest uppercase mb-3 sm:mb-4 border-b-2 pb-1"
            style={{ color: "#BC9255", borderColor: "#BC9255" }}
          >
            تسوّق حسب الأقسام
          </span>
          <h2 className="text-xl sm:text-3xl lg:text-5xl font-extrabold mb-2 leading-tight" style={{ color: "#0A1825" }}>
            اختر قسمك المفضّل <span style={{ color: "#BC9255" }}>وابدأ التسوّق</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-semibold sm:font-normal text-[#0A1825]/60">
            أفضل الأجهزة الأصلية بأسعار لا تُقاوم وضمان موثوق
          </p>
        </div>
      </div>

      {/* Scrollable cards with auto-scroll + drag */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-8 pb-4 select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {items.map((cat, i) => (
          <Link
            href={cat.href}
            key={`${cat.name}-${i}`}
            draggable={false}
            onClick={(e) => { if (isDragging) e.preventDefault(); }}
            className="group relative w-40 sm:w-52 md:w-60 flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#BC9255]/10 hover:border-[#BC9255]/40 shadow-[0_4px_20px_rgba(188,146,85,0.08)] transition-shadow duration-300"
          >
            <div className="relative w-full h-28 sm:h-36 md:h-44 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f9f6f1] to-[#efe8dc]" />
              <Image src={cat.image} alt={cat.name} fill className="relative object-cover pointer-events-none" sizes="(max-width:640px) 160px,(max-width:768px) 208px,240px" loading="lazy" quality={60} draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>
            <div className="relative px-3 sm:px-4 pb-3 sm:pb-4 -mt-3">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                {cat.icon && <span style={{ color: "#BC9255" }}>{cat.icon}</span>}
                <h3 className="text-[13px] sm:text-[15px] font-bold text-[#0A1825]">{cat.name}</h3>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#0A1825]/70 mb-2 sm:mb-3 leading-relaxed">{cat.desc}</p>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 border-[#BC9255]/40 group-hover:border-[#BC9255] group-hover:bg-[#BC9255] transition-colors duration-300">
                <span className="text-[10px] sm:text-xs font-extrabold text-[#BC9255] group-hover:text-white transition-colors duration-300">تسوّق الآن</span>
                <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#BC9255] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
