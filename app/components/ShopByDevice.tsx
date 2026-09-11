"use client";

import { useState, useEffect, Fragment } from "react";

export default function ShopByDevice() {
  const target = new Date(process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T20:00:00+03:00").getTime();
  const [visible, setVisible] = useState(() => Date.now() < target);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setVisible(false); return; }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const units = [
    { value: timeLeft.days, label: "يوم" },
    { value: timeLeft.hours, label: "ساعة" },
    { value: timeLeft.minutes, label: "دقيقة" },
    { value: timeLeft.seconds, label: "ثانية" },
  ];

  return (
    <section
      className="w-full py-10 sm:py-14 flex flex-col items-center gap-6 text-center"
      dir="rtl"
      style={{ background: "linear-gradient(to bottom, #ffffff, #FFF8F0)" }}
    >
      <h2 className="text-2xl sm:text-4xl font-black" style={{ color: "#1F2C3E" }}>
        iPhone 18{" "}
        <span style={{ color: "#A77D4B" }}>في طريقه إليك</span>
      </h2>

      <div
        className="px-8 py-5 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #FFF8F0, #FFF3E8)",
          border: "1.5px solid rgba(167,125,75,0.3)",
        }}
      >
        <p className="text-xs font-semibold mb-4" style={{ color: "#A77D4B" }}>
          الوقت المتبقي على الطلب المسبق
        </p>
        <div className="flex items-center gap-3 justify-center">
          {units.map(({ value, label }, i) => (
            <Fragment key={label}>
              <div className="flex flex-col items-center">
                <span
                  className="text-4xl font-black tabular-nums"
                  style={{ color: "#1F2C3E" }}
                >
                  {String(value).padStart(2, "0")}
                </span>
                <span
                  className="text-[11px] font-semibold mt-1"
                  style={{ color: "#A77D4B" }}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <span
                  className="text-2xl font-black pb-4"
                  style={{ color: "#A77D4B" }}
                >
                  :
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
