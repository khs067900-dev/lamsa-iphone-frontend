"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CalendarDays, PackageCheck } from "lucide-react";

const DEFAULT_SLIDES = ["/i-18-1.webp", "/i-18-2.webp", "/i-18-3.webp"];

function useCountdown(target: Date, onExpire: () => void) {
  const calledRef = useRef(false);
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0 });
        if (!calledRef.current) { calledRef.current = true; onExpire(); }
        return;
      }
      setT(calc());
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return t;
}

interface ComingSoonProps {
  modelName: string;
  slides?: string[];
  reservationDate: string;
}

export default function ComingSoon({ modelName, slides, reservationDate }: ComingSoonProps) {
  const images = slides?.length ? slides : DEFAULT_SLIDES;
  const target = new Date(reservationDate);
  const [active, setActive] = useState(0);
  const [expired, setExpired] = useState(() => Date.now() >= target.getTime());
  const countdown = useCountdown(target, () => setExpired(true));

  useEffect(() => {
    if (expired) return;
    const id = setInterval(() => setActive((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length, expired]);

  if (expired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { v: countdown.d, l: "يوم" },
    { v: countdown.h, l: "ساعة" },
    { v: countdown.m, l: "دقيقة" },
    { v: countdown.s, l: "ثانية" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(147,197,253,0); }
          50%       { box-shadow: 0 0 22px 4px rgba(147,197,253,0.18); }
        }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.15s; }
        .fade-up-3 { animation-delay: 0.25s; }
        .fade-up-4 { animation-delay: 0.35s; }
        .fade-up-5 { animation-delay: 0.45s; }
        .countdown-card { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      <div
        className="relative w-full overflow-hidden flex flex-col"
        dir="rtl"
      >
        {/* Background slides */}
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1500"
            style={{ opacity: i === active ? 1 : 0, transitionDuration: "1.5s" }}
          >
            <Image src={src} alt={modelName} fill className="object-cover object-center" priority={i === 0} sizes="100vw" />
          </div>
        ))}

        {/* Overlay — stronger at top & bottom for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-end text-center px-4 sm:px-6 py-10 sm:py-14 gap-4 sm:gap-5 w-full max-w-md mx-auto">

          {/* Badge */}
          <div className="fade-up fade-up-1">
            <span
              className="inline-flex items-center gap-1.5 font-bold tracking-[0.22em] uppercase px-4 py-1.5 rounded-full"
              style={{
                fontSize: "clamp(0.52rem, 2vw, 0.62rem)",
                background: "rgba(147,197,253,0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(147,197,253,0.35)",
                color: "#93c5fd",
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300" />
              قريباً
            </span>
          </div>

          {/* Model name */}
          <h1
            className="fade-up fade-up-2 font-black leading-[1.0] tracking-tight"
            style={{
              fontSize: "clamp(2rem, 9vw, 4rem)",
              background: "linear-gradient(135deg, #ffffff 30%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {modelName}
          </h1>

          {/* Tagline */}
          <p
            className="fade-up fade-up-3 font-medium text-white/60 -mt-1"
            style={{ fontSize: "clamp(0.72rem, 2.8vw, 0.9rem)" }}
          >
            التجربة القادمة تستحق الانتظار
          </p>

          {/* Divider */}
          <div
            className="fade-up fade-up-3 w-16 rounded-full mx-auto"
            style={{ height: 1.5, background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.5), transparent)" }}
          />

          {/* Countdown */}
          <div className="fade-up fade-up-4 flex gap-2 sm:gap-3 justify-center w-full" dir="ltr">
            {units.map(({ v, l }) => (
              <div
                key={l}
                className="countdown-card flex flex-col items-center justify-center rounded-2xl flex-1"
                style={{
                  padding: "clamp(10px, 3vw, 18px) 4px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(147,197,253,0.2)",
                  minWidth: 0,
                }}
              >
                <span
                  className="font-black text-white tabular-nums leading-none"
                  style={{ fontSize: "clamp(1.2rem, 5vw, 2.2rem)" }}
                >
                  {pad(v)}
                </span>
                <span
                  className="font-medium text-blue-200/60 mt-1"
                  style={{ fontSize: "clamp(0.48rem, 1.5vw, 0.6rem)" }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>

          {/* Info cards */}
          <div className="fade-up fade-up-5 flex gap-2 sm:gap-3 w-full">
            {[
              { Icon: CalendarDays, label: "فتح باب الحجز", value: "12 سبتمبر 2026" },
              { Icon: PackageCheck, label: "موعد التوفير", value: "18 سبتمبر 2026" },
            ].map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 px-2 sm:px-3 py-3 sm:py-4 rounded-2xl flex-1"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Icon size={16} className="text-blue-300/70" strokeWidth={1.8} />
                <span className="font-medium text-white/40 text-center leading-tight" style={{ fontSize: "clamp(0.48rem, 1.6vw, 0.58rem)" }}>
                  {label}
                </span>
                <span className="font-bold text-white text-center leading-tight" style={{ fontSize: "clamp(0.58rem, 2.2vw, 0.75rem)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 items-center">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`الشريحة ${i + 1}`}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === active ? 24 : 6,
                height: 6,
                background: i === active
                  ? "linear-gradient(90deg, #93c5fd, #818cf8)"
                  : "rgba(255,255,255,0.28)",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
