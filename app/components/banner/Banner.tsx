"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaApple } from "react-icons/fa";
import { IoShieldCheckmarkOutline, IoRocketOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";

const slides = [
  {
    image: "/i-18.webp",
    tag: "متاح الآن حصرياً",
    title: "iPhone 18",
    titleHighlight: "خذه اليوم",
    description: "كن في الصف الأول — أحدث إصدار من Apple متاح الآن حصرياً على لمسه",
    buttons: [{ text: "اطلبه الآن", href: "/smartphones/apple/iphone-18" }],
  },
];

const TRUST = [
  { icon: <IoShieldCheckmarkOutline size={14} />, label: "ضمان رسمي" },
  { icon: <TbTruckDelivery size={15} />, label: "توصيل سريع" },
  { icon: <FaApple size={12} />, label: "أصلي 100%" },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section
      className="relative w-full min-h-[44vh] sm:min-h-[58vh] md:min-h-[88vh] flex items-center overflow-hidden"
      style={{ backgroundColor: "#060e18" }}
    >
      <style>{`
        @keyframes bannerFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bannerGlow{0%,100%{opacity:.4}50%{opacity:.8}}
        .b-fade-0{animation:bannerFadeUp .6s ease both}
        .b-fade-1{animation:bannerFadeUp .6s .12s ease both}
        .b-fade-2{animation:bannerFadeUp .6s .24s ease both}
        .b-fade-3{animation:bannerFadeUp .6s .36s ease both}
        .b-glow{animation:bannerGlow 4s ease-in-out infinite}
        .b-cta{background:linear-gradient(135deg,#BC9255,#e8c98a,#BC9255);background-size:200% auto;transition:all .3s ease}
        .b-cta:hover{background-position:right center;transform:translateY(-2px);box-shadow:0 10px 35px rgba(188,146,85,.4)}
        .b-cta:active{transform:translateY(0)}
      `}</style>

      {/* Background image */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{ opacity: i === current ? 1 : 0}}
        >
          <Image
            src={s.image}
            alt={s.tag}
            fill
            className="object-cover object-center "
            priority={i === 0}
            sizes="100vw"
            quality={80}
          />
        </div>
      ))}

      {/* Overlays */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(110deg, rgba(6,14,24,0.95) 0%, rgba(6,14,24,0.7) 45%, rgba(6,14,24,0.2) 100%)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060e18]/80 via-transparent to-transparent" />
      <div
        className="b-glow absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(188,146,85,0.08) 0%, transparent 55%)" }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-14 py-10 sm:py-14 md:py-20" dir="rtl">
        <div className="max-w-xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-5 border border-[#BC9255]/40 bg-[#BC9255]/10 text-[#BC9255] backdrop-blur-md">
            <FaApple size={13} />
            {slide.tag}
          </div>

          {/* Headline */}
          <h1 className="b-fade-1 text-[2rem] sm:text-4xl md:text-6xl font-black leading-[1.1] mb-3 sm:mb-4 text-white">
            {slide.title}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #BC9255, #e8c98a, #a07840)" }}
            >
              {slide.titleHighlight}
            </span>
          </h1>

          {/* Description */}
          <p className="b-fade-2 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 text-white/60 max-w-md">
            {slide.description}
          </p>

          {/* CTA */}
          <div className="b-fade-3 flex flex-wrap items-center gap-3 mb-7 sm:mb-10">
            {slide.buttons.map((btn) => (
              <a
                key={btn.text}
                href={btn.href}
                className="b-cta inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-[13px] sm:text-[15px] font-black text-[#060e18]"
              >
                <IoRocketOutline size={17} />
                {btn.text}
              </a>
            ))}
          </div>

          {/* Trust badges */}
          {mounted && (
            <div className="b-fade-3 flex flex-wrap items-center gap-4 sm:gap-6">
              {TRUST.map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/35 font-medium">
                  <span className="text-[#BC9255]/70">{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`الانتقال للشريحة ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === current ? 28 : 8,
                backgroundColor: i === current ? "#BC9255" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-[#060e18]/60 to-transparent pointer-events-none" />
    </section>
  );
}
