"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { Product } from "../../../components/products/types";
import {
  getThumbnailUrl,
  getMainImageUrl,
  isCloudinaryUrl,
  resolveImageUrl,
} from "../../../lib/imageUrl";

interface Props {
  product: Product;
  hasVariants: boolean;
  /** When provided, these images replace the product-level images (used for color variants) */
  overrideImages?: string[];
}

function GalleryInner({
  product,
  images,
}: {
  product: Product;
  images: string[];
}) {
  const [selected, setSelected] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const discountPercent =
    product.discountPercent ||
    (product.salePrice && product.originalPrice
      ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
      : 0);

  const goTo = useCallback(
    (i: number) => {
      setSelected((i + images.length) % images.length);
    },
    [images.length]
  );

  const goNext = useCallback(() => goTo(selected + 1), [goTo, selected]);
  const goPrev = useCallback(() => goTo(selected - 1), [goTo, selected]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, images.length]);

  const currentRaw = images[selected];
  const currentImg = currentRaw ? getMainImageUrl(currentRaw, 900) : "";
  const isCloudinary = isCloudinaryUrl(currentImg);

  // Preload next image in gallery
  const nextRaw = images[(selected + 1) % images.length];
  const nextImg = nextRaw && images.length > 1 ? getMainImageUrl(nextRaw, 900) : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Next Image Preloader */}
      {nextImg && (
        <link rel="preload" as="image" href={nextImg} />
      )}

      {/* Main Image Container */}
      <div
        className="relative group aspect-square rounded-2xl overflow-hidden select-none"
        style={{ backgroundColor: "#faf7f2" }}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40 && images.length > 1) {
            // Drag left -> Next; Drag right -> Prev
            if (diff > 0) goNext();
            else goPrev();
          }
          setTouchStart(null);
        }}
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute z-10 top-3 right-3 pointer-events-none">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
              style={{ backgroundColor: "#1F2C3E", color: "#DFC4A4" }}
            >
              {discountPercent}% خصم
            </span>
          </div>
        )}

        {/* Counter Badge */}
        {images.length > 1 && (
          <div
            className="absolute top-3 left-3 z-10 text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none"
            style={{ background: "rgba(31,44,62,0.07)", color: "#A77D4B" }}
          >
            {selected + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows for desktop & hover */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/80 hover:bg-white shadow-md text-[#1F2C3E] opacity-70 group-hover:opacity-100 transition-all active:scale-90"
              aria-label="الصورة السابقة"
            >
              <IoChevronForward size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/80 hover:bg-white shadow-md text-[#1F2C3E] opacity-70 group-hover:opacity-100 transition-all active:scale-90"
              aria-label="الصورة التالية"
            >
              <IoChevronBack size={18} />
            </button>
          </>
        )}

        {/* Main Image */}
        {currentImg ? (
          <Image
            key={currentImg}
            src={currentImg}
            alt={product.name}
            fill
            className="object-contain p-6 sm:p-8 transition-opacity duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 750px"
            priority
            loading="eager"
            unoptimized={isCloudinary}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">📱</div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {images.map((src, i) => {
            const thumbUrl = getThumbnailUrl(src, 140);
            const isThumbCloudinary = isCloudinaryUrl(thumbUrl);
            const isActive = i === selected;
            return (
              <button
                key={`${i}-${src}`}
                onClick={() => setSelected(i)}
                className="relative shrink-0 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer active:scale-95"
                style={{
                  width: 68,
                  height: 68,
                  backgroundColor: "#faf7f2",
                  border: `2px solid ${isActive ? "#BC9255" : "#ede8e0"}`,
                  boxShadow: isActive ? "0 2px 8px rgba(188,146,85,0.25)" : "none",
                  opacity: isActive ? 1 : 0.65,
                }}
                aria-label={`عرض الصورة ${i + 1}`}
              >
                <Image
                  src={thumbUrl}
                  alt=""
                  fill
                  className="object-contain p-1.5"
                  sizes="68px"
                  loading="lazy"
                  unoptimized={isThumbCloudinary}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductGallery({ product, overrideImages }: Props) {
  const sourceImages = overrideImages?.length
    ? overrideImages
    : [...(product.images ?? []), ...(product.image ? [product.image] : [])];

  const allImages = [...new Set(sourceImages)]
    .filter(Boolean)
    .map(resolveImageUrl)
    .filter((src) => {
      try {
        new URL(src);
        return true;
      } catch {
        return false;
      }
    });

  // Re-mount GalleryInner when the active images set or first image changes
  const galleryKey = overrideImages?.length
    ? `variant-${overrideImages[0]}-${overrideImages.length}`
    : `product-${allImages[0] || "empty"}-${allImages.length}`;

  return <GalleryInner key={galleryKey} product={product} images={allImages} />;
}
