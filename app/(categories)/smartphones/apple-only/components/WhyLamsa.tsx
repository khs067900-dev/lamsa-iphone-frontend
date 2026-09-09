"use client";

import { HiShieldCheck, HiCreditCard, HiTruck } from "react-icons/hi2";

const features = [
  { icon: HiShieldCheck, title: "ضمان رسمي", desc: "ضمان معتمد على جميع الأجهزة من أبل" },
  { icon: HiCreditCard, title: "دفع آمن", desc: "طرق دفع متعددة ومشفّرة بالكامل" },
  { icon: HiTruck, title: "توصيل سريع", desc: "شحن سريع لجميع مناطق المملكة" },
];

export default function WhyLamsa() {
  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#DFC4A4" }} />
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: "#1F2C3E" }}>لماذا لمسة؟</h2>
          <p className="text-[10px] sm:text-[11px]" style={{ color: "rgba(31,44,62,0.4)" }}>ثقة آلاف العملاء في المملكة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{ background: "linear-gradient(135deg, #1F2C3E 0%, #162030 100%)" }}
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ background: "#DFC4A4" }} />

            <div className="relative z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 border border-[#DFC4A4]/20 transition-transform duration-300 group-hover:scale-110" style={{ background: "rgba(223,196,164,0.12)" }}>
                <f.icon size={20} style={{ color: "#DFC4A4" }} />
              </div>
              <h3 className="text-[13px] sm:text-[15px] font-black mb-1.5 text-white">{f.title}</h3>
              <p className="text-[10px] sm:text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{f.desc}</p>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, #DFC4A4, transparent)" }} />
          </div>
        ))}
      </div>
    </section>
  );
}
