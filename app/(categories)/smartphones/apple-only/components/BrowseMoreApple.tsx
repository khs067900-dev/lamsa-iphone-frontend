"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaApple } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

const appleAccessories = [
  { title: "شاحن أبل", desc: "شحن سريع وآمن", emoji: "🔌", href: "/accessories?brand=apple&type=charger" },
  { title: "AirPods", desc: "صوت نقي بلا حدود", emoji: "🎧", href: "/accessories?brand=apple&type=airpods" },
  { title: "MacBook Air", desc: "قوة الأداء المحمولة", emoji: "💻", href: "/laptops/macbook-air" },
  { title: "iPad", desc: "إبداع بلا حدود", emoji: "📱", href: "/tablets/ipad" },
  { title: "Apple Watch", desc: "ذكاء على معصمك", emoji: "⌚", href: "/smartwatches?brand=apple" },
];

export default function BrowseMoreApple() {
  return (
    <section className="mb-16">
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: "#1F2C3E" }}>
          <FaApple size={18} style={{ color: "#DFC4A4" }} />
        </div>
        <h2 className="text-base sm:text-lg font-black" style={{ color: "#1F2C3E" }}>تصفّح المزيد من أبل</h2>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {appleAccessories.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
          >
            <Link
              href={item.href}
              className="group flex flex-col items-center text-center p-5 sm:p-6 rounded-[20px] border border-[#EBE6E2] hover:border-[#DFC4A4] transition-all duration-300 hover:shadow-xl h-full"
              style={{ backgroundColor: "#fff" }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: "#F5EBE0" }}>
                <span className="text-2xl sm:text-3xl">{item.emoji}</span>
              </div>
              <h3 className="text-[12px] sm:text-[14px] font-bold mb-1" style={{ color: "#1F2C3E" }}>{item.title}</h3>
              <p className="text-[10px] sm:text-[11px] mb-3" style={{ color: "rgba(31,44,62,0.5)" }}>{item.desc}</p>
              <div className="mt-auto flex items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-transform group-hover:-translate-x-1" style={{ color: "#DFC4A4" }}>
                تصفّح <IoArrowBack size={12} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
