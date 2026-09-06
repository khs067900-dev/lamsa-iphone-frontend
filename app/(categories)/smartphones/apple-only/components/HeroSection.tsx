"use client";

import Link from "next/link";
import Image from "next/image";
import { IoHomeOutline, IoChevronBack } from "react-icons/io5";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";

export default function HeroSection({ productCount, loading }: { productCount: number; loading: boolean }) {
  return (
    <div className="relative overflow-hidden h-[300px] sm:h-[480px] md:h-[560px]" style={{ backgroundColor: "#0a0a0a" }}>
      <Image src="/apple-hero.webp" alt="أجهزة أبل" fill className="object-cover opacity-30" style={{ objectPosition: "center" }} priority sizes="100vw" />
      
      {/* Animated gradient overlays */}
      <motion.div 
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(223,196,164,0.08) 0%, transparent 60%)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
      
      {/* Floating particles */}
      <motion.div
        className="absolute top-20 left-[20%] w-2 h-2 rounded-full bg-[#DFC4A4]/20"
        animate={{ y: [-20, 20, -20], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-40 right-[30%] w-1.5 h-1.5 rounded-full bg-[#DFC4A4]/30"
        animate={{ y: [15, -15, 15], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 h-full flex flex-col justify-between">
        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-white/60 pt-4 sm:pt-8">
          <Link href="/" className="hover:text-white transition flex items-center gap-1"><IoHomeOutline size={13} />الرئيسية</Link>
          <IoChevronBack size={11} className="opacity-50" />
          <Link href="/smartphones" className="hover:text-white transition">الهواتف الذكية</Link>
          <IoChevronBack size={11} className="opacity-50" />
          <span className="text-[#DFC4A4] font-medium">منتجات أبل</span>
        </motion.nav>

        {/* Main content */}
        <div className="pb-10 sm:pb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[12px] font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full mb-3 sm:mb-5 border border-[#DFC4A4]/30 bg-[#DFC4A4]/10 text-[#DFC4A4] backdrop-blur-md"
          >
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <FaApple size={16} />
            </motion.span>
            Apple Official Store
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
            className="text-2xl sm:text-5xl md:text-6xl font-black text-white leading-[1.2] mb-2 sm:mb-4"
          >
            عالم{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-l from-[#DFC4A4] via-[#f5e6d3] to-[#DFC4A4] bg-clip-text text-transparent">iPhone</span>
              <motion.span 
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#DFC4A4] to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </span>
            {" "}بين يديك
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xs sm:text-lg text-white/50 max-w-md leading-relaxed"
          >
            أداء خارق • تصميم أيقوني • تجربة لا مثيل لها
          </motion.p>

          {!loading && productCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 mt-4 sm:mt-7"
            >
              <span className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-bold bg-white/5 border border-white/10 text-white/70 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {productCount} منتج متوفر الآن
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[60px]">
          <path d="M0,40 C480,80 960,0 1440,50 L1440,80 L0,80Z" fill="#FDFBF8" />
        </svg>
      </div>
    </div>
  );
}
