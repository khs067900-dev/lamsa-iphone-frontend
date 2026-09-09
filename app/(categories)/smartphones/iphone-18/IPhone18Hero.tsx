"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [{
    src: "/i-18-2.webp",
    tag: "iPhone 18 Pro",
    headline: "الأكثر انتظارًا.",
    body: "أداء غير مسبوق مع A20 Pro ونظام تبريد متطور — بطارية تدوم أكثر، كاميرا 48MP، وتصميم Unibody بواجهة Ceramic Shield.",
    badges: ["+6 ساعات بطارية", "A20 Pro", "48MP Fusion", "Ceramic Shield"],
    cta: "قوة جديدة. تجربة Pro جديدة.",
    ctaSub: "قريبًا على لمسة",
  },
  {
    src: "/i-18-1.webp",
    tag: "iPhone 18 Pro",
    headline: "أطول عمر للبطارية في iPhone على الإطلاق.",
    body: "قوة استثنائية، أداء Pro، وتصميم متين صُمم ليرافقك أبعد من أي وقت مضى.",
    badges: ["4 ألوان مذهلة", "مقاسان يناسبان أسلوبك"],
    cta: "الطلب المسبق يبدأ 12 سبتمبر",
    ctaSub: "متوفر ابتداءً من 18 سبتمبر",
  },
  
  {
    src: "/i-18-3.webp",
    tag: "48MP Fusion Main Camera",
    headline: "تفاصيل أكثر. إضاءة أفضل.",
    body: "فتحة عدسة متغيرة تمنحك تحكمًا أكبر في الضوء، وعمق مجال مذهل يضيف لمسة احترافية لكل لقطة.",
    badges: ["فتحة عدسة متغيرة", "إضاءة ليلية محسّنة", "عمق مجال مذهل"],
    cta: "كل لقطة تستحق أن تُرى.",
    ctaSub: "",
  },
];

export default function IPhone18Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "55vh", minHeight: 320, maxHeight: 550 }}>
      <style>{`
        @keyframes i18Up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .i18-a{animation:i18Up .7s .1s cubic-bezier(.22,1,.36,1) both}
        .i18-b{animation:i18Up .7s .22s cubic-bezier(.22,1,.36,1) both}
        .i18-c{animation:i18Up .7s .34s cubic-bezier(.22,1,.36,1) both}
      `}</style>

      {/* Slides */}
      {slides.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === active ? 1 : 0 }}>
          <Image src={s.src} alt={s.headline} fill className="object-cover object-center" priority={i === 0} sizes="100vw" />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />

      {/* Text — centered bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center pb-16 px-6" dir="rtl" key={active}>
        {slides[active].tag ? (
          <>
            <span className="i18-a text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-2">iPhone 18 Pro</span>
            <h1 className="i18-b text-3xl sm:text-5xl font-black text-white leading-snug mb-2">
              {slides[active].headline}
            </h1>
            <p className="i18-c text-sm sm:text-base text-white/75 font-medium max-w-md mb-3">
              {slides[active].body}
            </p>
            <div className="flex gap-2 mb-3 flex-wrap justify-center">
              {slides[active].badges?.map((b, i) => (
                <span key={i} className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(6px)" }}>{b}</span>
              ))}
            </div>
            <p className="text-xs text-white/50">
              <span className="text-white/80 font-semibold">{slides[active].cta}</span> &nbsp;·&nbsp; {slides[active].ctaSub}
            </p>
          </>
        ) : (
          <>
            <span className="i18-a text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-3">
              {(slides[active] as {label?: string}).label}
            </span>
            <h1 className="i18-b text-4xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-3">
              {slides[active].headline}
            </h1>
            <p className="i18-c text-base sm:text-lg text-white/70 font-medium">
              {(slides[active] as {sub?: string}).sub}
            </p>
          </>
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`الشريحة ${i + 1}`}
            className="rounded-full transition-all duration-500"
            style={{ width: i === active ? 24 : 6, height: 6, backgroundColor: i === active ? "#fff" : "rgba(255,255,255,0.35)" }}
          />
        ))}
      </div>
    </section>
  );
}
