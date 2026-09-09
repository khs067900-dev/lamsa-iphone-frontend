"use client";

import Link from "next/link";
import Image from "next/image";
import { IoHomeOutline, IoChevronBack, IoShieldCheckmarkOutline, IoRocketOutline } from "react-icons/io5";
import { FaApple } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";

export default function HeroSection({ productCount, loading }: { productCount: number; loading: boolean }) {
  return (
    <div className="relative overflow-hidden h-[360px] sm:h-[520px] md:h-[600px]" style={{ backgroundColor: "#0a0a0a" }}>
      <style>{`
        @keyframes heroPulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes heroFloat1{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes heroFloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(14px)}}
        @keyframes heroUnderline{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes heroFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroScale{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
        .hero-pulse{animation:heroPulse 4s ease-in-out infinite}
        .hero-float-1{animation:heroFloat1 5s ease-in-out infinite}
        .hero-float-2{animation:heroFloat2 4s ease-in-out infinite}
        .hero-underline{animation:heroUnderline .7s .9s ease both;transform-origin:left}
        .hero-fade-up-0{animation:heroFadeUp .6s ease both}
        .hero-fade-up-2{animation:heroFadeUp .7s .25s ease both}
        .hero-fade-up-3{animation:heroFadeUp .6s .45s ease both}
        .hero-fade-up-4{animation:heroFadeUp .6s .65s ease both}
        .hero-fade-up-5{animation:heroFadeUp .6s .85s ease both}
        .hero-scale{animation:heroScale .5s .15s ease both}
        .hero-cta{background:linear-gradient(135deg,#DFC4A4,#f5e6d3,#DFC4A4);background-size:200% auto;transition:all .3s ease}
        .hero-cta:hover{background-position:right center;transform:translateY(-2px);box-shadow:0 8px 30px rgba(223,196,164,.35)}
      `}</style>

      <Image src="/apple-only.webp" alt="أجهزة أبل" fill className="object-cover" style={{ objectPosition: "center" }} priority sizes="100vw" />

      <div className="hero-pulse absolute inset-0" style={{ background: "radial-gradient(ellipse at 25% 60%, rgba(223,196,164,0.12) 0%, transparent 55%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 100%)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

      <div className="hero-float-1 absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-[#DFC4A4]/25" />
      <div className="hero-float-2 absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#DFC4A4]/35" />
      <div className="hero-float-1 absolute bottom-[30%] left-[40%] w-1 h-1 rounded-full bg-white/20" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-between">
        <nav className="hero-fade-up-0 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-white/50 pt-4 sm:pt-8">
          <Link href="/" className="hover:text-white transition flex items-center gap-1"><IoHomeOutline size={13} />الرئيسية</Link>
          <IoChevronBack size={11} className="opacity-40" />
          <Link href="/smartphones" className="hover:text-white transition">الهواتف الذكية</Link>
          <IoChevronBack size={11} className="opacity-40" />
          <span className="text-[#DFC4A4] font-medium">منتجات أبل</span>
        </nav>

        <div className="pb-10 sm:pb-16">
          <div className="hero-scale inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-5 border border-[#DFC4A4]/40 bg-[#DFC4A4]/10 text-[#DFC4A4] backdrop-blur-md">
            <FaApple size={14} />
            متجر أبل الرسمي المعتمد
          </div>

          <h1 className="hero-fade-up-2 text-[1.7rem] sm:text-5xl md:text-[3.5rem] font-black text-white leading-[1.15] mb-3 sm:mb-4">
            اكتشف قوة{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-l from-[#DFC4A4] via-[#f5e6d3] to-[#c9a87c] bg-clip-text text-transparent">iPhone</span>
              <span className="hero-underline absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#DFC4A4] to-transparent" />
            </span>
            <br className="sm:hidden" />{" "}الحقيقية
          </h1>

          <p className="hero-fade-up-3 text-sm sm:text-lg text-white/60 max-w-sm sm:max-w-lg leading-relaxed mb-5 sm:mb-7">
            أحدث إصدارات أبل بأسعار تنافسية — أصلية 100% مع ضمان رسمي
          </p>

          <div className="hero-fade-up-4 flex flex-wrap items-center gap-3">
            <Link href="#products" className="hero-cta inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-[12px] sm:text-[13px] font-black text-[#1a1a1a]">
              <IoRocketOutline size={16} />
              تسوق الآن
            </Link>
            {!loading && productCount > 0 && (
              <span className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/5 border border-white/10 text-white/60 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {productCount} منتج متاح
              </span>
            )}
          </div>

          <div className="hero-fade-up-5 flex flex-wrap items-center gap-4 sm:gap-6 mt-5 sm:mt-6">
            {[
              { icon: <IoShieldCheckmarkOutline size={13} />, label: "ضمان رسمي" },
              { icon: <TbTruckDelivery size={14} />, label: "توصيل سريع" },
              { icon: <FaApple size={11} />, label: "أصلي 100%" },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/40 font-medium">
                <span className="text-[#DFC4A4]/70">{icon}</span>
                {label}
              </span>
            ))}
          </div>
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
