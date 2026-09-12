"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import type { ProductSection } from "../../../components/products/types";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const GOLD = "#BC9255";
const GOLD_LIGHT = "#DFC4A4";
const DARK = "#1F2C3E";

function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <InView>
      <motion.div variants={fadeUp} className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full" style={{ background: `linear-gradient(to bottom, ${GOLD}, ${GOLD_LIGHT}40)` }} />
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] uppercase mb-0.5" style={{ color: GOLD }}>{label}</p>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: DARK }}>{title}</h2>
          </div>
        </div>
        {subtitle && <p className="text-sm sm:mr-auto" style={{ color: "#A77D4B" }}>{subtitle}</p>}
      </motion.div>
    </InView>
  );
}

function ExpandableText({ text, className }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 120;
  return (
    <div>
      <p className={className}>{isLong && !expanded ? text.slice(0, 120) + "…" : text}</p>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="mt-1 flex items-center gap-1 text-[11px] font-black transition-colors cursor-pointer" style={{ color: `${GOLD}80` }}>
          {expanded ? "أقل" : "المزيد"}
          <svg className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── DESIGN SECTION ───
function DesignSection({ section }: { section: ProductSection }) {
  const features: { id: string; label: string; title: string; image: string; colors?: { name: string; colorCode: string; image: string; title?: string }[] }[] =
    ((section.content as Record<string, unknown>)?.features as never[] ?? []).flat();

  const [active, setActive] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const feat = features[active];
  const displayImage = feat?.id === "colors" && feat.colors?.length ? feat.colors[colorIdx].image : feat?.image;

  return (
    <section className="mt-16" dir="rtl">
      <SectionHeader label="التصميم" title={section.title} />
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden" style={{ minHeight: "clamp(360px, 60vw, 560px)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={displayImage} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
            {displayImage && <Image src={displayImage} alt={feat?.label ?? ""} fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-10" style={{ minHeight: "clamp(360px, 60vw, 560px)" }}>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="mb-4 max-w-lg">
              <p className="text-[10px] font-black tracking-widest uppercase text-white/50 mb-1.5">{feat?.label}</p>
              <AnimatePresence mode="wait">
                <motion.p key={feat?.id === "colors" ? colorIdx : active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="text-base sm:text-2xl font-black text-white leading-snug sm:leading-relaxed">
                  {feat?.id === "colors" && feat.colors?.[colorIdx]?.title ? feat.colors[colorIdx].title : feat?.title}
                </motion.p>
              </AnimatePresence>
              {feat?.id === "colors" && feat.colors && (
                <div className="flex gap-2.5 mt-3">
                  {feat.colors.map((c, ci) => (
                    <button key={ci} title={c.name} onClick={() => setColorIdx(ci)} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 cursor-pointer ${colorIdx === ci ? "scale-110 shadow-lg" : "border-white/40"}`} style={{ backgroundColor: c.colorCode, borderColor: colorIdx === ci ? GOLD : undefined }} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible scrollbar-hide">
            {features.map((f, i) => (
              <button key={`${f.id}-${i}`} onClick={() => { setActive(i); setColorIdx(0); }} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer backdrop-blur-sm shrink-0 ${active === i ? "bg-white text-gray-900 shadow-lg" : "bg-white/15 text-white hover:bg-white/25 border border-white/20"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CAMERA SECTION ───
function LensesCard({ lensesCard }: { lensesCard: { image: string; lenses: { name: string; model: string; specs: string[] }[] } }) {
  const [active, setActive] = useState(0);
  const lens = lensesCard.lenses[active];
  return (
    <InView>
      <motion.div variants={fadeUp} className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4">
        <div className="relative w-full" style={{ minHeight: "clamp(260px, 50vw, 400px)" }}>
          <Image src={lensesCard.image} alt="نظام الكاميرا" fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />
        </div>
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8">
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
            {lensesCard.lenses.map((l, i) => (
              <button key={i} onClick={() => setActive(i)} className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer backdrop-blur-sm ${active === i ? "bg-white text-gray-900 shadow-lg" : "bg-white/15 text-white border border-white/20"}`}>
                {l.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{lens.model}</p>
              <p className="text-sm sm:text-base font-black text-white mb-2">{lens.name}</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {lens.specs.map((s, si) => (
                  <li key={si} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                    <span className="text-[11px] sm:text-xs text-white/60">{s}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </InView>
  );
}

function CameraSection({ section }: { section: ProductSection }) {
  const content = section.content as Record<string, unknown>;
  const hero = content?.hero as { stats: { value: string; label: string }[]; description: string } | undefined;
  const zoomLevels = content?.zoomLevels as { label: string; image: string }[] ?? [];
  const zoomFooter = content?.zoomFooter as { text: string; image?: string } | undefined;
  const lensesCard = content?.lensesCard as { image: string; lenses: { name: string; model: string; specs: string[] }[] } | undefined;
  const proPhotos = content?.proPhotos as { title: string; items: { image: string; label: string }[] } | undefined;
  const proVideo = content?.proVideo as { title: string; items: { image: string; label: string }[] } | undefined;
  const video = content?.video as { title: string; subtitle: string; description: string; image: string } | undefined;
  const [activeZoom, setActiveZoom] = useState(0);

  return (
    <section className="mt-16" dir="rtl">
      <SectionHeader label="الكاميرا" title={section.title} subtitle={section.subtitle} />

      {section.media?.[0]?.url && hero && (
        <InView>
          <motion.div variants={fadeUp} className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4" style={{ minHeight: "clamp(300px, 55vw, 480px)" }}>
            <Image src={section.media[0].url} alt={section.media[0].alt ?? ""} fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
            <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-10" style={{ minHeight: "clamp(300px, 55vw, 480px)" }}>
              <div className="flex gap-5 sm:gap-14 mb-3 sm:mb-5 justify-center sm:justify-start">
                {hero.stats.map((s, i) => (
                  <motion.div key={i} variants={fadeUp} className="text-center sm:text-right">
                    <p className="text-2xl sm:text-5xl font-black text-white">{s.value}</p>
                    <p className="text-[9px] sm:text-xs text-white/50 mt-0.5 max-w-[80px] leading-snug">{s.label}</p>
                  </motion.div>
                ))}
              </div>
              <ExpandableText text={hero.description} className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl" />
            </div>
          </motion.div>
        </InView>
      )}

      {zoomLevels.length > 0 && (
        <InView>
          <motion.div variants={fadeUp} className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4" style={{ minHeight: "clamp(260px, 50vw, 400px)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeZoom} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                <Image src={zoomLevels[activeZoom].image} alt={zoomLevels[activeZoom].label} fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10">
              <AnimatePresence mode="wait">
                <motion.div key={activeZoom} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="backdrop-blur-md text-white text-base sm:text-2xl font-black px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                  {zoomLevels[activeZoom].label}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 inset-x-0 z-10 p-3 sm:p-5">
              {zoomFooter && <p className="text-white/60 text-[10px] sm:text-xs text-center mb-2 sm:mb-3 hidden sm:block">{zoomFooter.text}</p>}
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto sm:justify-center sm:flex-wrap scrollbar-hide pb-0.5">
                {zoomLevels.map((z, i) => (
                  <button key={i} onClick={() => setActiveZoom(i)} className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer backdrop-blur-sm ${activeZoom === i ? "bg-white text-gray-900 shadow-lg" : "bg-white/15 text-white hover:bg-white/25 border border-white/20"}`}>
                    {z.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </InView>
      )}

      {zoomFooter && zoomLevels.length === 0 && (
        <InView>
          <motion.div variants={fadeUp} className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4" style={{ minHeight: "clamp(220px, 40vw, 340px)" }}>
            {zoomFooter.image && <Image src={zoomFooter.image} alt="zoom" fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-10" style={{ minHeight: "clamp(220px, 40vw, 340px)" }}>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-2xl">{zoomFooter.text}</p>
            </div>
          </motion.div>
        </InView>
      )}

      {lensesCard && <LensesCard lensesCard={lensesCard} />}

      {proPhotos && (
        <InView>
          <motion.div variants={fadeUp} className="mb-4">
            <p className="text-sm sm:text-base font-black mb-3" style={{ color: DARK }} dir="rtl">{proPhotos.title}</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {proPhotos.items.map((item, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden shrink-0" style={{ width: "clamp(220px, 60vw, 320px)", aspectRatio: "3/4" }}>
                  <Image src={item.image} alt={item.label} fill className="object-cover" sizes="320px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <p className="absolute bottom-0 inset-x-0 p-3 text-white text-[11px] sm:text-xs font-semibold leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </InView>
      )}

      {video && (
        <InView>
          <motion.div variants={fadeUp} className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4" style={{ minHeight: "clamp(240px, 50vw, 420px)" }}>
            <Image src={video.image} alt={video.title} fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-10">
              <p className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-1">{video.title}</p>
              <p className="text-base sm:text-2xl font-black text-white mb-2 leading-snug">{video.subtitle}</p>
              <ExpandableText text={video.description} className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl" />
            </div>
          </motion.div>
        </InView>
      )}

      {proVideo && (
        <InView>
          <motion.div variants={fadeUp} className="mb-4">
            <p className="text-sm sm:text-base font-black mb-3" style={{ color: DARK }} dir="rtl">{proVideo.title}</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {proVideo.items.map((item, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden shrink-0" style={{ width: "clamp(220px, 60vw, 320px)", aspectRatio: "3/4" }}>
                  <Image src={item.image} alt={item.label} fill className="object-cover" sizes="320px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <p className="absolute bottom-0 inset-x-0 p-3 text-white text-[11px] sm:text-xs font-semibold leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </InView>
      )}
    </section>
  );
}

// ─── PERFORMANCE SECTION ───
function PerformanceSection({ section }: { section: ProductSection }) {
  const content = section.content as Record<string, unknown>;
  const description = content?.description as string | undefined;
  const chips = content?.chips as { name: string; description: string }[] ?? [];
  const [active, setActive] = useState(0);

  return (
    <section className="mt-16" dir="rtl">
      <SectionHeader label="الأداء" title={section.title} subtitle={section.subtitle} />
      <InView>
        <motion.div variants={fadeUp} className="relative rounded-2xl sm:rounded-3xl overflow-hidden" style={{ backgroundColor: "#1a1a2e" }}>
          {section.media?.[0]?.url && (
            <div className="relative w-full" style={{ minHeight: "clamp(200px, 40vw, 320px)" }}>
              <Image src={section.media[0].url} alt={section.media[0].alt ?? ""} fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1), #1a1a2e)" }} />
            </div>
          )}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${GOLD}20` }} />
          <div className="relative z-10 p-4 sm:p-10">
            {description && <ExpandableText text={description} className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl mb-4 sm:mb-6" />}
            {chips.length > 0 && (
              <>
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
                  {chips.map((c, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${active === i ? "text-white shadow-lg" : "text-white/60 hover:bg-white/15 border border-white/10"}`} style={{ backgroundColor: active === i ? GOLD : "rgba(255,255,255,0.08)" }}>
                      {c.name}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-sm font-black text-white mb-2">{chips[active].name}</p>
                    <ExpandableText text={chips[active].description} className="text-xs sm:text-sm text-white/60 leading-relaxed" />
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      </InView>
    </section>
  );
}

// ─── BATTERY SECTION ───
function BatterySection({ section }: { section: ProductSection }) {
  const content = section.content as Record<string, unknown>;
  const description = content?.description as string | undefined;
  const stats = content?.stats as { value: string; unit: string; label: string }[] ?? [];

  return (
    <section className="mt-16" dir="rtl">
      <SectionHeader label="البطارية" title={section.title} subtitle={section.subtitle} />
      <InView>
        <motion.div variants={fadeUp} className="relative rounded-2xl sm:rounded-3xl overflow-hidden" style={{ backgroundColor: "#0f1a0f" }}>
          {section.media?.[0]?.url && (
            <div className="relative w-full" style={{ minHeight: "clamp(180px, 35vw, 280px)" }}>
              <Image src={section.media[0].url} alt={section.media[0].alt ?? ""} fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1), #0f1a0f)" }} />
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${GOLD}15` }} />
          <div className="relative z-10 p-4 sm:p-10">
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                {stats.map((s, i) => (
                  <motion.div key={i} variants={fadeUp} className="text-center border-l border-white/8 last:border-0 pl-3 sm:pl-6 last:pl-0">
                    <div className="flex items-end justify-center gap-1 mb-1">
                      <span className="text-2xl sm:text-5xl font-black text-white leading-none">{s.value}</span>
                      <span className="text-xs sm:text-base font-bold mb-0.5 sm:mb-2" style={{ color: GOLD }}>{s.unit}</span>
                    </div>
                    <p className="text-[9px] sm:text-xs text-white/40 leading-snug max-w-[100px] mx-auto">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {description && <ExpandableText text={description} className="text-xs sm:text-sm text-white/50 leading-relaxed text-center max-w-2xl mx-auto" />}
          </div>
        </motion.div>
      </InView>
    </section>
  );
}

// ─── MAIN EXPORT ───
export default function ProductSections({ sections }: { sections?: ProductSection[] }) {
  if (!sections?.length) return null;
  const active = sections.filter((s) => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div className="pb-10">
      {active.map((s) => {
        if (s.type === "design")      return <DesignSection      key={s._id ?? s.type} section={s} />;
        if (s.type === "camera")      return <CameraSection      key={s._id ?? s.type} section={s} />;
        if (s.type === "performance") return <PerformanceSection key={s._id ?? s.type} section={s} />;
        if (s.type === "battery")     return <BatterySection     key={s._id ?? s.type} section={s} />;
        return null;
      })}
    </div>
  );
}
