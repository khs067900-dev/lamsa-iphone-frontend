"use client";

import { useState, useRef, useEffect } from "react";
import { IoCheckmarkCircle, IoDocumentTextOutline, IoListOutline, IoCardOutline, IoSparkles, IoDiamondOutline } from "react-icons/io5";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("ar-SA");

const specLabels: [keyof NonNullable<Product["specs"]>, string, string][] = [
  ["screen", "الشاشة", "📱"],
  ["processor", "المعالج", "⚡"],
  ["ram", "الرام", "🧠"],
  ["storage", "التخزين", "💾"],
  ["rearCamera", "الكاميرا الخلفية", "📸"],
  ["frontCamera", "الكاميرا الأمامية", "🤳"],
  ["battery", "البطارية", "🔋"],
  ["batteryLife", "عمر البطارية", "⏱️"],
  ["charging", "الشحن", "🔌"],
  ["os", "نظام التشغيل", "💻"],
  ["extras", "مميزات إضافية", "✨"],
];

interface ProductDetailsProps {
  installment?: Product["installment"];
  description?: string;
  specs?: Product["specs"];
}

type Tab = "specs" | "installment" | "description";

const tabMeta: Record<Tab, { icon: typeof IoListOutline; label: string }> = {
  specs: { icon: IoListOutline, label: "المواصفات" },
  description: { icon: IoDocumentTextOutline, label: "الوصف" },
  installment: { icon: IoCardOutline, label: "التقسيط" },
};

export default function ProductDetails({ installment, description, specs }: ProductDetailsProps) {
  const hasSpecs = specs && Object.values(specs).some(Boolean);
  const tabs: { key: Tab; show: boolean }[] = [
    { key: "specs", show: !!hasSpecs },
    { key: "description", show: !!description },
    { key: "installment", show: !!installment?.available },
  ];
  const visibleTabs = tabs.filter((t) => t.show);
  const [active, setActive] = useState<Tab>(visibleTabs[0]?.key || "specs");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const idx = visibleTabs.findIndex((t) => t.key === active);
    const el = tabsRef.current[idx];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visibleTabs.length]);

  if (!visibleTabs.length) return null;

  return (
    <div className="mt-5 sm:mt-8 md:mt-14 relative bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] shadow-lg sm:shadow-xl shadow-black/[.03] overflow-hidden" style={{ border: "1px solid #EBE6E2" }}>
      {/* ─── Tabs ─── */}
      <div className="relative border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "#EBE6E2", backgroundColor: "#faf7f2" }}>
        <div className="flex relative">
          <div
            className="absolute bottom-0 h-[2.5px] sm:h-[3px] rounded-t-full transition-all duration-400 ease-out"
            style={{ left: indicator.left, width: indicator.width, background: "linear-gradient(90deg, #BC9255, #DFC4A4)" }}
          />
          {visibleTabs.map((t, idx) => {
            const m = tabMeta[t.key];
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                ref={(el) => { tabsRef.current[idx] = el; }}
                onClick={() => setActive(t.key)}
                className={`flex-1 min-w-[80px] sm:min-w-[110px] flex items-center justify-center gap-1 sm:gap-2.5 py-3 sm:py-5 md:py-6 text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-300 ${
                  isActive ? "bg-white/60" : "hover:bg-white/40"
                }`}
                style={{ color: isActive ? "#1F2C3E" : "#A77D4B" }}
              >
                <m.icon size={13} className="transition-colors duration-300 sm:hidden" style={{ color: isActive ? "#BC9255" : undefined }} />
                <m.icon size={17} className="transition-colors duration-300 hidden sm:block" style={{ color: isActive ? "#BC9255" : undefined }} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="p-3 sm:p-5 md:p-8">
        {/* Specs */}
        {active === "specs" && hasSpecs && (
          <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ border: "1px solid #EBE6E2" }}>
            {specLabels.map(([key, label, emoji], i) =>
              specs[key] ? (
                <div
                  key={key}
                  className="flex items-start sm:items-center text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-5 md:px-6 py-2.5 sm:py-4 md:py-[18px] gap-2 sm:gap-4 transition-colors hover:bg-[#BC9255]/[0.03]"
                  style={{ backgroundColor: i % 2 === 0 ? "#faf7f2" : "#fff" }}
                >
                  <span className="text-xs sm:text-base md:text-lg w-4 sm:w-7 text-center shrink-0">{emoji}</span>
                  <span className="w-16 sm:w-28 md:w-40 shrink-0 font-semibold" style={{ color: "#A77D4B" }}>{label}</span>
                  <span className="flex-1 min-w-0 break-words font-semibold" style={{ color: "#1F2C3E" }}>{specs[key]}</span>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Description - Card with produ.webp background */}
        {active === "description" && description && (() => {
          const lines = description.split("\n").map((l) => l.trim()).filter(Boolean);
          const title = lines[0];
          const items = lines.slice(1);
          return (
            <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden" style={{ backgroundImage: "url('/produ.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
              {/* Glass overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.93) 0%, rgba(245,240,232,0.9) 50%, rgba(255,255,255,0.87) 100%)", backdropFilter: "blur(3px)" }} />

              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-28 sm:w-44 md:w-56 h-28 sm:h-44 md:h-56 rounded-full opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(188,146,85,0.15), transparent 70%)", transform: "translate(30%, -30%)" }} />
              <div className="absolute bottom-0 left-0 w-24 sm:w-36 md:w-44 h-24 sm:h-36 md:h-44 rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(223,196,164,0.2), transparent 70%)", transform: "translate(-20%, 20%)" }} />

              {/* Content */}
              <div className="relative z-10 p-4 sm:p-6 md:p-9 lg:p-10">
                {/* Title */}
                {title && (
                  <div className="flex items-center gap-2.5 sm:gap-3.5 md:gap-4 mb-4 sm:mb-6 md:mb-8">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)", boxShadow: "0 4px 16px rgba(188,146,85,0.25)" }}>
                      <IoDiamondOutline size={16} className="text-white sm:hidden" />
                      <IoDiamondOutline size={20} className="text-white hidden sm:block md:hidden" />
                      <IoDiamondOutline size={26} className="text-white hidden md:block" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] sm:text-base md:text-lg lg:text-xl font-black leading-snug truncate" style={{ color: "#1F2C3E" }}>{title}</h3>
                      <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium mt-0.5" style={{ color: "#A77D4B" }}>ما يميّز هذا المنتج عن غيره</p>
                    </div>
                  </div>
                )}

                {/* Feature Items - Timeline */}
                {items.length > 0 && (
                  <div className="relative pr-4 sm:pr-5 md:pr-6">
                    {/* Vertical line */}
                    <div className="absolute top-1 right-[7px] sm:right-[9px] md:right-[11px] bottom-1 w-[1.5px] sm:w-[2px] rounded-full" style={{ background: "linear-gradient(to bottom, #BC9255, #DFC4A4, transparent)" }} />

                    <div className="flex flex-col gap-2 sm:gap-3 md:gap-3.5">
                      {items.map((line, i) => {
                        const cleanLine = line.replace(/^[•\-\*]\s*/, "");
                        return (
                          <div key={i} className="relative flex items-start group">
                            {/* Dot */}
                            <div className="absolute right-[-16px] sm:right-[-20px] md:right-[-24px] top-2.5 sm:top-3 md:top-3.5 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full border-[2px] sm:border-[2.5px] group-hover:scale-150 transition-transform duration-300" style={{ borderColor: "#BC9255", backgroundColor: "#fff" }} />

                            {/* Card */}
                            <div className="flex-1 rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5" style={{ backgroundColor: "rgba(255,255,255,0.7)", border: "1px solid rgba(188,146,85,0.1)", backdropFilter: "blur(6px)" }}>
                              <div className="flex items-center gap-2 sm:gap-2.5">
                                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: "rgba(188,146,85,0.1)", color: "#BC9255" }}>
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <p className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-semibold leading-relaxed" style={{ color: "#1F2C3E" }}>
                                  {cleanLine}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom badge */}
                {items.length > 0 && (
                  <div className="mt-4 sm:mt-6 md:mt-8 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-[11px] font-bold px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-sm text-white" style={{ background: "linear-gradient(135deg, #BC9255, #A77D4B)" }}>
                      <IoSparkles size={11} className="sm:hidden" />
                      <IoSparkles size={13} className="hidden sm:block" />
                      {items.length} ميزة مضمونة
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Installment */}
        {active === "installment" && installment?.available && (
          <div className="space-y-3 sm:space-y-5 md:space-y-6">
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6" style={{ backgroundColor: "#faf7f2", border: "1px solid #EBE6E2" }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(188,146,85,0.1)" }}>
                  <IoCardOutline size={14} className="sm:hidden" style={{ color: "#BC9255" }} />
                  <IoCardOutline size={16} className="hidden sm:block md:hidden" style={{ color: "#BC9255" }} />
                  <IoCardOutline size={18} className="hidden md:block" style={{ color: "#BC9255" }} />
                </div>
                <p className="text-[11px] sm:text-xs md:text-sm lg:text-base font-bold" style={{ color: "#1F2C3E" }}>احصل عليه بأقساط شهرية مريحة</p>
              </div>
              {installment.downPayment && (
                <p className="text-[10px] sm:text-[11px] md:text-xs mr-9 sm:mr-12 md:mr-[52px]" style={{ color: "#A77D4B" }}>مقدم {fmt(installment.downPayment)} ر.س والباقي أقساط</p>
              )}
              {installment.note && <p className="text-[9px] sm:text-[10px] md:text-xs mt-1 sm:mt-2 mr-9 sm:mr-12 md:mr-[52px]" style={{ color: "rgba(167,125,75,0.7)" }}>{installment.note}</p>}
            </div>

            {installment.policy && (
              <div className="text-center py-1.5 sm:py-2 md:py-3">
                <span className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-bold px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full" style={{ color: "#A77D4B", backgroundColor: "rgba(188,146,85,0.08)", border: "1px solid rgba(188,146,85,0.15)" }}>
                  ♕ {installment.policy} ♕
                </span>
              </div>
            )}

            {installment.conditions && installment.conditions.length > 0 && (
              <div>
                <p className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-bold mb-2 sm:mb-3 md:mb-4" style={{ color: "#1F2C3E" }}>شروط التقديم</p>
                <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                  {installment.conditions.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3 md:gap-3.5 text-[10px] sm:text-[11px] md:text-xs lg:text-sm rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 transition-colors hover:bg-[#BC9255]/[0.03]" style={{ color: "#1F2C3E", backgroundColor: "#faf7f2", border: "1px solid #EBE6E2" }}>
                      <IoCheckmarkCircle size={14} className="shrink-0 mt-0.5 sm:hidden" style={{ color: "#BC9255" }} />
                      <IoCheckmarkCircle size={16} className="shrink-0 mt-0.5 hidden sm:block" style={{ color: "#BC9255" }} />
                      <span className="font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
