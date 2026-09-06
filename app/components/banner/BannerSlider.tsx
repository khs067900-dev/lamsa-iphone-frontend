"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";

const AUTO_PLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

export default function BannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (i: number) => setCurrent((i + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % images.length), AUTO_PLAY_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 pt-4 pb-2" dir="rtl">
      <div
        className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-3xl group"
        style={{ boxShadow: "0 25px 60px -12px rgba(13, 148, 136, 0.25), 0 0 0 1px rgba(13, 148, 136, 0.08)" }}
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1));
        }}
      >
        <div className="relative aspect-[2/1] sm:aspect-[2.2/1]">
          {images.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <Image
                src={src}
                alt={`banner ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 1152px"
                quality={75}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(current + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
              aria-label="التالي"
            >
              <IoChevronForward size={20} />
            </button>
            <button
              onClick={() => goTo(current - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
              aria-label="السابق"
            >
              <IoChevronBack size={20} />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
                style={{ width: i === current ? 32 : 12 }}
              >
                <span className="absolute inset-0 bg-white/30 rounded-full" />
                {i === current ? (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #5eead4, #14b8a6, #0d9488)",
                      transformOrigin: "right",
                      animation: `progress ${AUTO_PLAY_MS}ms linear`,
                    }}
                  />
                ) : (
                  <span className="absolute inset-0 bg-white/40 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-300/50 to-transparent" />
      </div>

      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
