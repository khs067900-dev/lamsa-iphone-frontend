"use client";

import Link from "next/link";
import Image from "next/image";
import { IoHomeOutline, IoChevronBack } from "react-icons/io5";
import { FaApple } from "react-icons/fa";

export default function HeroSection({ productCount, loading }: { productCount: number; loading: boolean }) {
  return (
    <div className="relative overflow-hidden h-[300px] sm:h-[480px] md:h-[560px]" style={{ backgroundColor: "#0a0a0a" }}>
      <style>{`
        @keyframes heroPulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes heroFloat1{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes heroFloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(15px)}}
        @keyframes heroUnderline{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes heroFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroScale{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
        .hero-pulse{animation:heroPulse 4s ease-in-out infinite}
        .hero-float-1{animation:heroFloat1 5s ease-in-out infinite}
        .hero-float-2{animation:heroFloat2 4s ease-in-out infinite}
        .hero-underline{animation:heroUnderline .6s .8s ease both;transform-origin:left}
        .hero-fade-up-0{animation:heroFadeUp .6s ease both}
        .hero-fade-up-1{animation:heroFadeUp .6s .2s ease both}
        .hero-fade-up-2{animation:heroFadeUp .7s .3s ease both}
        .hero-fade-up-3{animation:heroFadeUp .6s .5s ease both}
        .hero-fade-up-4{animation:heroFadeUp .6s .7s ease both}
        .hero-scale{animation:heroScale .5s .2s ease both}
      `}</style>

      <Image src="/apple-hero.webp" alt="أجهزة أبل" fill className="object-cover opacity-30" style={{ objectPosition: "center" }} priority sizes="100vw" />

      <div className="hero-pulse absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(223,196,164,0.08) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

      <div className="hero-float-1 absolute top-20 left-[20%] w-2 h-2 rounded-full bg-[#DFC4A4]/20" />
      <div className="hero-float-2 absolute top-40 right-[30%] w-1.5 h-1.5 rounded-full bg-[#DFC4A4]/30" />

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 h-full flex flex-col justify-between">
        <nav className="hero-fade-up-0 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-white/60 pt-4 sm:pt-8">
          <Link href="/" className="hover:text-white transition flex items-center gap-1"><IoHomeOutline size={13} />الرئيسية</Link>
          <IoChevronBack size={11} className="opacity-50" />
          <Link href="/smartphones" className="hover:text-white transition">الهواتف الذكية</Link>
          <IoChevronBack size={11} className="opacity-50" />
          <span className="text-[#DFC4A4] font-medium">منتجات أبل</span>
        </nav>

        <div className="pb-10 sm:pb-20">
          <div className="hero-scale inline-flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[12px] font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full mb-3 sm:mb-5 border border-[#DFC4A4]/30 bg-[#DFC4A4]/10 text-[#DFC4A4] backdrop-blur-md">
            <FaApple size={16} />
            Apple Official Store
          </div>

          <h1 className="hero-fade-up-2 text-2xl sm:text-5xl md:text-6xl font-black text-white leading-[1.2] mb-2 sm:mb-4">
            عالم{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-l from-[#DFC4A4] via-[#f5e6d3] to-[#DFC4A4] bg-clip-text text-transparent">iPhone</span>
              <span className="hero-underline absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#DFC4A4] to-transparent" />
            </span>
            {" "}بين يديك
          </h1>

          <p className="hero-fade-up-3 text-xs sm:text-lg text-white/50 max-w-md leading-relaxed">
            أداء خارق • تصميم أيقوني • تجربة لا مثيل لها
          </p>

          {!loading && productCount > 0 && (
            <div className="hero-fade-up-4 flex items-center gap-3 mt-4 sm:mt-7">
              <span className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-bold bg-white/5 border border-white/10 text-white/70 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {productCount} منتج متوفر الآن
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[60px]">
          <path d="M0,40 C480,80 960,0 1440,50 L1440,80 L0,80Z" fill="#FDFBF8" />
        </svg>
      </div>
    </div>
  );
}
