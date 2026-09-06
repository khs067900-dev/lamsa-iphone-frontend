"use client";

import { motion } from "framer-motion";
import { HiShieldCheck, HiCreditCard, HiTruck } from "react-icons/hi2";

const features = [
  { icon: HiCreditCard, title: "دفع آمن", desc: "طرق دفع متعددة ومشفّرة" },
  { icon: HiShieldCheck, title: "ضمان رسمي", desc: "ضمان معتمد على جميع الأجهزة" },
  { icon: HiTruck, title: "توصيل سريع", desc: "شحن سريع لجميع المناطق" },
];

export default function WhyLamsa() {
  return (
    <section className="mb-10 sm:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#BC9255" }} />
        <h2 className="text-lg sm:text-xl font-black text-[#0A1825]">لماذا لمسة؟</h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            className="relative p-4 sm:p-5 rounded-2xl border border-[#EBE6E2] hover:border-[#BC9255]/30 transition-all duration-300 group overflow-hidden"
            style={{ background: "linear-gradient(135deg, #FFFFFF, #FAF7F3)" }}
          >
            <div className="flex items-center gap-3 mb-1.5 sm:mb-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-[#BC9255]/10 border border-[#BC9255]/20">
                <f.icon size={16} className="text-[#BC9255]" />
              </div>
              <span className="text-[12px] sm:text-[14px] font-bold text-[#0A1825]">{f.title}</span>
            </div>
            <p className="text-[10px] sm:text-[12px] mr-[48px] sm:mr-[52px] text-[#0A1825]/40">{f.desc}</p>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "rgba(188,146,85,0.08)" }} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
