"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaApple } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

const appleProducts = [
  {
    id: "macbook-air",
    title: "MacBook Air",
    desc: "خفيف. قوي. جاهز لكل شيء.",
    image: "/mac.webp",
    href: "/laptops/macbook-air",
  },
  {
    id: "airpods",
    title: "AirPods",
    desc: "صوت غامر. تجربة سلسة.",
    image: "/air-pod.webp",
    href: "/accessories/airpods",
  },
  {
    id: "ipad",
    title: "iPad",
    desc: "إبداع بلا حدود في يدك.",
    image: "/ipad.webp",
    href: "/tablets/ipad",
  },
];

export default function MoreAppleProducts() {
  return (
    <section className="mb-10 sm:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center border border-[#DFC4A4]/20" style={{ background: "linear-gradient(135deg, #1F2C3E, #2a3d55)" }}>
          <FaApple size={18} className="text-[#DFC4A4]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: "#1F2C3E" }}>تسوّق المزيد من منتجات أبل</h2>
          <p className="text-[10px] sm:text-[11px] text-[#1F2C3E]/40">اكتشف عالم أبل الكامل</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
        {appleProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 80 }}
          >
            <Link
              href={product.href}
              className="group block rounded-3xl overflow-hidden border border-[#EBE6E2] hover:border-[#DFC4A4]/50 transition-all duration-400 hover:shadow-xl"
              style={{ background: "linear-gradient(180deg, #FFFFFF 50%, #F9F6F2 100%)" }}
            >
              <div className="relative h-[120px] sm:h-[200px] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain p-4 sm:p-8 transition-all duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle at 50% 80%, rgba(223,196,164,0.1), transparent 60%)" }} />
              </div>
              <div className="p-3 sm:p-5 border-t border-[#EBE6E2]/60">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[12px] sm:text-[15px] font-bold truncate" style={{ color: "#1F2C3E" }}>{product.title}</h3>
                    <p className="text-[9px] sm:text-[12px] mt-0.5 sm:mt-1 truncate" style={{ color: "rgba(31,44,62,0.5)" }}>{product.desc}</p>
                  </div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md" style={{ backgroundColor: "#DFC4A4" }}>
                    <IoArrowBack size={12} style={{ color: "#1F2C3E" }} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
