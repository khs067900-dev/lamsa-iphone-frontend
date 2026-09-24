"use client";

import { useState } from "react";
import Image from "../../../components/ProductImage";
import type { Product } from "../../../components/products/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

interface Props {
  product: Product;
  hasVariants: boolean;
  /** When provided, these images replace the product-level images (used for color variants) */
  overrideImages?: string[];
}

// Inner component receives a stable `images` array already resolved.
// It always mounts fresh (via the key in ProductGallery) so useState(0) is correct.
function GalleryInner({
  product,
  images,
}: {
  product: Product;
  images: string[];
}) {
  const [selected, setSelected] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const discountPercent =
    product.discountPercent ||
    (product.salePrice && product.originalPrice
      ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
      : 0);

  const goTo = (i: number) => setSelected((i + images.length) % images.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#faf7f2" }}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40 && images.length > 1) goTo(selected + (diff > 0 ? 1 : -1));
        }}
      >
        {discountPercent > 0 && (
          <div className="absolute z-10 top-3 right-3">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
              style={{ backgroundColor: "#1F2C3E", color: "#DFC4A4" }}
            >
              {discountPercent}% خصم
            </span>
          </div>
        )}

        {images.length > 1 && (
          <div
            className="absolute top-3 left-3 z-10 text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(31,44,62,0.07)", color: "#A77D4B" }}
          >
            {selected + 1} / {images.length}
          </div>
        )}

        {images[selected] ? (
          <Image
            src={images[selected]}
            alt={product.name}
            fill
            className="object-contain p-8 transition-opacity duration-200"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">📱</div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="relative shrink-0 rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                width: 68,
                height: 68,
                backgroundColor: "#faf7f2",
                border: `2px solid ${i === selected ? "#BC9255" : "#ede8e0"}`,
                opacity: i === selected ? 1 : 0.6,
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-contain p-2"
                sizes="68px"
                loading="lazy"
              />
            </button>
          ))}
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
    .map(resolveImg)
    .filter((src) => {
      try {
        new URL(src);
        return true;
      } catch {
        return false;
      }
    });

  // key changes whenever the variant's first image changes → GalleryInner remounts
  // with selected=0, no useEffect needed.
  const galleryKey = allImages[0] ?? "empty";

  return <GalleryInner key={galleryKey} product={product} images={allImages} />;
}
