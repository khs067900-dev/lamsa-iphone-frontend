"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import IPhone18HomeSection from "./IPhone18HomeSection";
import type { FeaturedEntry } from "../lib/iphone18Featured";



export default function ShopByDevice({ entries, initiallyOpen }: { entries: FeaturedEntry[]; initiallyOpen: boolean }) {
  const target = new Date(process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T20:00:00+03:00").getTime();
  const [timerDone, setTimerDone] = useState(initiallyOpen);
  const [, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (timerDone) return;
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimerDone(true); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    const onVisible = () => { if (document.visibilityState === "visible") calc(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [target, timerDone]);

  if (timerDone) return <IPhone18HomeSection entries={entries} />;

  return (
    <section
      className="w-full py-10 sm:py-14 flex flex-col items-center gap-6 text-center"
      dir="rtl"
      style={{ background: "linear-gradient(to bottom, #ffffff, #FFF8F0)" }}
    >
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#A77D4B" }}>
        كن في الصف الأول
      </p>

      <h2 className="text-2xl sm:text-4xl font-black leading-snug" style={{ color: "#1F2C3E" }}>
        أحدث إصدار من Apple{" "}
        <span style={{ color: "#A77D4B" }}>متاح الآن حصرياً</span>
      </h2>

      <Link
        href="/smartphones"
        className="mt-2 px-8 py-3 rounded-full text-white font-bold text-base transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #A77D4B, #C9973E)" }}
      >
        اطلبه الآن
      </Link>

      <div className="flex items-center gap-6 mt-1">
        {[
          { icon: "✓", text: "ضمان رسمي" },
          { icon: "⚡", text: "توصيل سريع" },
        ].map(({ icon, text }) => (
          <span key={text} className="text-sm font-semibold" style={{ color: "#1F2C3E" }}>
            <span style={{ color: "#A77D4B" }}>{icon}</span> {text}
          </span>
        ))}
      </div>
    </section>
  );
}
