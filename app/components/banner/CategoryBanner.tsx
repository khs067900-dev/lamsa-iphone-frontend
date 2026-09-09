"use client";
import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";

const AUTO_PLAY_MS = 4000;
const SWIPE_THRESHOLD = 50;

function CategoryBannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback((i: number) => setCurrent((i + images.length) % images.length), [images.length]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % images.length), AUTO_PLAY_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  return (
    <div className="w-full px-3 sm:px-6 py-2">
      <div className="relative w-full overflow-hidden rounded-2xl">
        <div
          className="relative w-full"
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStart.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1));
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="transition-opacity duration-500 ease-in-out"
              style={{ opacity: i === current ? 1 : 0, position: i === current ? 'relative' : 'absolute', inset: 0 }}
            >
              <Image
                src={src}
                alt={`banner ${i + 1}`}
                width={1200}
                height={600}
                className="w-full h-auto"
                loading={i === 0 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 1024px"
                quality={75}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryBanner({ images: propImages }: { category?: string; images?: string[] }) {
  const images = propImages ?? [];

  if (!images.length) return null;
  return <CategoryBannerSlider images={images} />;
}
