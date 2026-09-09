"use client";

import Image from "next/image";
import Link from "next/link";
import { FaApple } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

const appleProducts = [
  { id: "macbook-air", title: "MacBook Air", desc: "خفيف. قوي. جاهز لكل شيء.", image: "/mac.webp", href: "/laptops/macbook-air" },
  { id: "airpods", title: "AirPods", desc: "صوت غامر. تجربة سلسة.", image: "/air-pod.webp", href: "/accessories/airpods" },
  { id: "ipad", title: "iPad", desc: "إبداع بلا حدود في يدك.", image: "/ipad.webp", href: "/tablets/ipad" },
];

export default function MoreAppleProducts() {
  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center border border-[#DFC4A4]/20" style={{ background: "linear-gradient(135deg, #1F2C3E, #2a3d55)" }}>
          <FaApple size={18} className="text-[#DFC4A4]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: "#1F2C3E" }}>تسوّق المزيد من أبل</h2>
          <p className="text-[10px] sm:text-[11px]" style={{ color: "rgba(31,44,62,0.4)" }}>اكتشف عالم أبل الكامل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {appleProducts.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#EBE6E2] hover:border-[#DFC4A4]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #F5F0EA 100%)" }}
          >
            {/* Image area */}
            <div className="relative h-[140px] sm:h-[180px] overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle at 50% 60%, rgba(223,196,164,0.15), transparent 65%)" }} />
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-5 sm:p-8 transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>

            {/* Content */}
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-[#EBE6E2]/70 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[13px] sm:text-[15px] font-black truncate" style={{ color: "#1F2C3E" }}>{product.title}</h3>
                <p className="text-[10px] sm:text-[12px] mt-0.5 truncate" style={{ color: "rgba(31,44,62,0.45)" }}>{product.desc}</p>
              </div>
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #1F2C3E, #2a3d55)" }}
              >
                <IoArrowBack size={13} style={{ color: "#DFC4A4" }} />
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, #DFC4A4, transparent)" }} />
          </Link>
        ))}
      </div>
    </section>
  );
}
