"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface HeroSlide {
  src: string;
  tag: string;
  headline: string;
  body: string;
  badges: string[];
}

const defaultSlides: HeroSlide[] = [
  {
    src: "/i-18-2.webp",
    tag: "iPhone 18",
    headline: "الجيل الجديد كلياً.",
    body: "تصميم Unibody ثوري، معالج A20 Pro، وكاميرا 48MP Fusion — iPhone 18 يعيد تعريف ما تتوقعه من هاتف.",
    badges: ["A20 Pro", "48MP Fusion", "Ceramic Shield", "تصميم Unibody"],
  },
  {
    src: "/i-18-1.webp",
    tag: "iPhone 18",
    headline: "أطول عمر للبطارية في iPhone.",
    body: "قوة استثنائية تدوم معك طوال اليوم وما بعده.",
    badges: ["+6 ساعات بطارية", "4 ألوان مذهلة"],
  },
  {
    src: "/i-18-3.webp",
    tag: "48MP Fusion Camera",
    headline: "تفاصيل أكثر. إضاءة أفضل.",
    body: "فتحة عدسة متغيرة وعمق مجال مذهل يضيف لمسة احترافية لكل لقطة.",
    badges: ["فتحة عدسة متغيرة", "إضاءة ليلية محسّنة"],
  }, {
    src: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789129092/472da8f7-71d6-4978-ad76-27cbfa1b0103.webp",
    tag: "iPhone Duo",
    headline: "أكبر شاشة iPhone على الإطلاق.",
    body: "تجربة شاشة استثنائية تمتد أمامك في تصميم نحيف قابل للطيّ — مساحة أكبر لكل ما تحب.",
    badges: ["شاشة قابلة للطي", "تصميم نحيف", "مساحة عرض أكبر"],
  },
  {
    src: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095830/c5a8d90b-ec81-4680-823f-1b460f0dc8ea.webp",
    tag: "iPhone Duo",
    headline: "عصر جديد من iPhone.",
    body: "أول تصميم iPhone قابل للطيّ، يجمع بين أناقة الهاتف وقوة الشاشة الكبيرة في تجربة واحدة.",
    badges: ["iPhone قابل للطي", "تصميم مبتكر", "شاشة أكبر"],
  },
];

interface Props {
  slides?: HeroSlide[];
}

export default function IPhone18StandardHero({ slides = defaultSlides }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section
      className="i18s-hero relative w-full overflow-hidden"
      style={{ height: "55vh", minHeight: 320, maxHeight: 550 }}
    >
      <style>{`
        @keyframes i18sUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .i18s-a{animation:i18sUp .7s .1s cubic-bezier(.22,1,.36,1) both}
        .i18s-b{animation:i18sUp .7s .22s cubic-bezier(.22,1,.36,1) both}
        .i18s-c{animation:i18sUp .7s .34s cubic-bezier(.22,1,.36,1) both}
        @media(max-width:640px){section.i18s-hero{height:38vh!important;min-height:240px!important}}
      `}</style>

      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <Image
            src={s.src}
            alt={s.headline}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }}
      />

      <div
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center pb-12 px-6"
        dir="rtl"
        key={active}
      >
        <span className="i18s-a text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-2">
          {slides[active].tag}
        </span>
        <h1 className="i18s-b text-3xl sm:text-5xl font-black text-white leading-snug mb-2">
          {slides[active].headline}
        </h1>
        <p className="i18s-c text-sm sm:text-base text-white/75 font-medium max-w-md mb-3">
          {slides[active].body}
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          {slides[active].badges.map((b, i) => (
            <span
              key={i}
              className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(6px)" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`الشريحة ${i + 1}`}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === active ? 24 : 6,
              height: 6,
              backgroundColor: i === active ? "#fff" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
