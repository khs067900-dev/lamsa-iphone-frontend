"use client";

import Link from "next/link";
import Image from "next/image";
import { IoHomeOutline, IoChevronBack } from "react-icons/io5";

export default function HeroSection({ productCount, loading }: { productCount: number; loading: boolean }) {
  return (
    <div className="relative overflow-hidden h-[300px] sm:h-[480px] md:h-[560px]" style={{ background: "linear-gradient(135deg, #f5f0e8 0%, #efe8dc 50%, #f9f6f1 100%)" }}>
      <style>{`
        @keyframes samPulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes samFloat1{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes samFloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(15px)}}
        @keyframes samUnderline{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes samFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes samScale{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
        .sam-pulse{animation:samPulse 4s ease-in-out infinite}
        .sam-float-1{animation:samFloat1 5s ease-in-out infinite}
        .sam-float-2{animation:samFloat2 4s ease-in-out infinite}
        .sam-underline{animation:samUnderline .6s .8s ease both;transform-origin:left}
        .sam-fade-up-0{animation:samFadeUp .6s ease both}
        .sam-fade-up-1{animation:samFadeUp .6s .2s ease both}
        .sam-fade-up-2{animation:samFadeUp .7s .3s ease both}
        .sam-fade-up-3{animation:samFadeUp .6s .5s ease both}
        .sam-fade-up-4{animation:samFadeUp .6s .7s ease both}
        .sam-scale{animation:samScale .5s .2s ease both}
      `}</style>

      <Image src="/sam.webp" alt="أجهزة سامسونج" fill className="object-cover opacity-20" style={{ objectPosition: "center" }} priority sizes="100vw" />

      <div className="sam-pulse absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(188,146,85,0.1) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#f5f0e8]/95 via-[#f5f0e8]/40 to-transparent" />

      <div className="sam-float-1 absolute top-20 left-[20%] w-2 h-2 rounded-full bg-[#BC9255]/30" />
      <div className="sam-float-2 absolute top-40 right-[30%] w-1.5 h-1.5 rounded-full bg-[#BC9255]/20" />

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 h-full flex flex-col justify-between">
        <nav className="sam-fade-up-0 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#0A1825]/50 pt-4 sm:pt-8">
          <Link href="/" className="hover:text-[#0A1825] transition flex items-center gap-1"><IoHomeOutline size={13} />الرئيسية</Link>
          <IoChevronBack size={11} className="opacity-50" />
          <Link href="/smartphones" className="hover:text-[#0A1825] transition">الهواتف الذكية</Link>
          <IoChevronBack size={11} className="opacity-50" />
          <span className="text-[#BC9255] font-medium">منتجات سامسونج</span>
        </nav>

        <div className="pb-10 sm:pb-20">
          <div className="sam-scale inline-flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[12px] font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full mb-3 sm:mb-5 border border-[#BC9255]/30 bg-[#BC9255]/10 text-[#BC9255] backdrop-blur-md">
            Samsung Galaxy
          </div>

          <h1 className="sam-fade-up-2 text-2xl sm:text-5xl md:text-6xl font-black leading-[1.2] mb-2 sm:mb-4" style={{ color: "#0A1825" }}>
            عالم{" "}
            <span className="relative inline-block">
              <span style={{ color: "#BC9255" }}>Galaxy</span>
              <span className="sam-underline absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#BC9255] to-transparent" />
            </span>
            {" "}بين يديك
          </h1>

          <p className="sam-fade-up-3 text-xs sm:text-lg text-[#0A1825]/50 max-w-md leading-relaxed">
            أداء خارق • تصميم مبتكر • ذكاء اصطناعي متقدم
          </p>

          {!loading && productCount > 0 && (
            <div className="sam-fade-up-4 flex items-center gap-3 mt-4 sm:mt-7">
              <span className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-bold bg-white/60 border border-[#BC9255]/20 text-[#0A1825]/70 backdrop-blur-sm">
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
