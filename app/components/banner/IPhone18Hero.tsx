"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

export default function IPhone18Hero() {
  const stars = useMemo(() =>
    Array.from({ length: 60 }, () => ({
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.6 + 0.1,
    })), []);
  return (
    <section
      dir="rtl"
      className="relative w-full min-h-[100svh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020810 0%, #0A1220 40%, #0D1A2E 70%, #060D18 100%)" }}
    >
      <style>{`
        @keyframes floatPhone{0%,100%{transform:translateY(0px) rotate(-2deg)}50%{transform:translateY(-18px) rotate(-2deg)}}
        @keyframes glowPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.8;transform:scale(1.08)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .float-phone{animation:floatPhone 5s ease-in-out infinite}
        .glow-pulse{animation:glowPulse 4s ease-in-out infinite}
        .fade-up-1{animation:fadeUp .7s .1s cubic-bezier(.22,1,.36,1) both}
        .fade-up-2{animation:fadeUp .7s .25s cubic-bezier(.22,1,.36,1) both}
        .fade-up-3{animation:fadeUp .7s .4s cubic-bezier(.22,1,.36,1) both}
        .fade-up-4{animation:fadeUp .7s .55s cubic-bezier(.22,1,.36,1) both}
        .shimmer-text{
          background:linear-gradient(90deg,#C8A96E,#F0D080,#C8A96E,#E8C060,#C8A96E);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 4s linear infinite;
        }
      `}</style>

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: s.width,
              height: s.height,
              top: s.top,
              left: s.left,
              backgroundColor: "white",
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* Glow behind phone */}
      <div
        className="glow-pulse absolute left-[5%] sm:left-[10%] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: "clamp(200px, 35vw, 500px)",
          height: "clamp(200px, 35vw, 500px)",
          background: "radial-gradient(circle, rgba(100,160,255,0.18) 0%, rgba(60,100,200,0.08) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 py-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-0">

        {/* ── TEXT SIDE ── */}
        <div className="flex-1 text-right order-2 lg:order-1 flex flex-col items-end">

          {/* Badge */}
          <div className="fade-up-1 inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border"
            style={{ borderColor: "rgba(200,169,110,0.4)", backgroundColor: "rgba(200,169,110,0.08)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#C8A96E" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#C8A96E" }}>
              متوفر حصرياً لدينا
            </span>
          </div>

          {/* Title */}
          <h1 className="fade-up-2 font-black leading-none mb-2" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            <span className="block text-white">iPhone</span>
            <span className="shimmer-text block">18</span>
          </h1>

          {/* Tagline */}
          <p className="fade-up-3 font-bold mb-4 text-white/70" style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}>
            المستقبل في يدك — الآن
          </p>

          {/* Description */}
          <p className="fade-up-3 text-white/50 leading-relaxed mb-8 max-w-md text-sm sm:text-base">
            أحدث إصدار من Apple يصل بتصميم أنحف، معالج أسرع، وكاميرا تعيد تعريف التصوير.
            <br />
            كن الأول — متوفر الآن فقط عندنا.
          </p>

          {/* Specs pills */}
          <div className="fade-up-3 flex flex-wrap gap-2 justify-end mb-8">
            {[
              { label: "معالج A19 Pro" },
              { label: "كاميرا 60MP" },
              { label: "شاشة ProMotion 6.3″" },
              { label: "بطارية يوم كامل" },
            ].map((s) => (
              <span
                key={s.label}
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {s.label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="fade-up-4 flex flex-wrap gap-3 justify-end">
            <Link
              href="/smartphones/iphone-18"
              className="px-7 py-3 rounded-full font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #C8A96E, #E8C060)", color: "#0A1220" }}
            >
              اطلب الآن
            </Link>
            <Link
              href="/smartphones/apple-only"
              className="px-7 py-3 rounded-full font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 border"
              style={{ borderColor: "rgba(200,169,110,0.5)", color: "#C8A96E" }}
            >
              تصفح أجهزة Apple
            </Link>
          </div>
        </div>

        {/* ── PHONE IMAGE SIDE ── */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2 relative">
          {/* Subtle ring */}
          <div
            className="absolute rounded-full border pointer-events-none"
            style={{
              width: "clamp(220px, 38vw, 520px)",
              height: "clamp(220px, 38vw, 520px)",
              borderColor: "rgba(200,169,110,0.08)",
              borderWidth: 1,
            }}
          />
          <div
            className="absolute rounded-full border pointer-events-none"
            style={{
              width: "clamp(170px, 28vw, 400px)",
              height: "clamp(170px, 28vw, 400px)",
              borderColor: "rgba(200,169,110,0.05)",
              borderWidth: 1,
            }}
          />

          <div className="float-phone relative" style={{ width: "clamp(180px, 28vw, 380px)", height: "clamp(340px, 52vw, 720px)" }}>
            <Image
              src="/i-18.webp"
              alt="iPhone 18"
              fill
              className="object-contain drop-shadow-2xl"
              priority
              sizes="(max-width:768px) 60vw, 30vw"
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(2,8,16,0.6))" }} />
    </section>
  );
}
