"use client";

import Link from "next/link";
import Image from "../ProductImage";
import { IoArrowForward } from "react-icons/io5";
import type { Product } from "./types";
import { normalizeProductForCard } from "../../lib/normalizeProduct";
import { getOptimizedImageUrl, isCloudinaryUrl } from "../../lib/imageUrl";
import { useCartStore } from "../../store/cartStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const fmt = (n: number) => n.toLocaleString("en-US");

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API}${src.startsWith("/") ? src : "/" + src}`;

export default function ProductCard({
  product,
  priority = false,
  imageZoom = false,
  imageScale = "scale-110",
}: {
  product: Product;
  priority?: boolean;
  imageZoom?: boolean;
  imageScale?: string;
}) {
  const { name, discountPercent, color, storage, image, originalPrice, salePrice } =
    normalizeProductForCard(product);
  const rawImage = image ? resolveImg(image) : undefined;
  const isCloudinary = isCloudinaryUrl(rawImage);
  const resolvedImage = rawImage
    ? (isCloudinary ? getOptimizedImageUrl(rawImage, { width: 400, crop: "limit", quality: "auto" }) : rawImage)
    : undefined;
  const hasDiscount = salePrice != null;
  const displayPrice = hasDiscount ? salePrice : originalPrice;

  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success("تمت الإضافة للسلة ✓", {
      duration: 1500,
      style: {
        background: "#1F2C3E",
        color: "#DFC4A4",
        fontWeight: "700",
        borderRadius: "12px",
        fontSize: "14px",
        padding: "12px 18px",
      },
    });
    setTimeout(() => {
      router.push("/cart");
    }, 1000);
  };

  return (
    <div
      className="product-card relative flex flex-col h-full rounded-2xl overflow-hidden bg-white shadow-xs"
      dir="rtl"
    >
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1">
        {/* ── Image ── */}
        <div
          className={`relative w-full overflow-hidden bg-white ${
            imageZoom ? "aspect-[4/3]" : "aspect-square"
          }`}
        >
          {/* Badge */}
          <div className="absolute z-10 top-3 right-3">
            {discountPercent > 0 ? (
              <span
                className="text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs"
                style={{ backgroundColor: "#1F2C3E", color: "#DFC4A4" }}
              >
                {discountPercent}% خصم
              </span>
            ) : (
              <span
                className="text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs"
                style={{ backgroundColor: "#DFC4A4", color: "#1F2C3E" }}
              >
                جديد
              </span>
            )}
          </div>

          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={name}
              fill
              unoptimized={isCloudinary}
              className={`object-contain transition-transform duration-300 ${
                imageZoom ? `p-0 ${imageScale}` : "p-4"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
              📱
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col px-2.5 sm:px-3.5 pt-2 sm:pt-3 pb-2 sm:pb-3">
          {/* Tags */}
          {(storage || color) && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {storage && (
                <span
                  className="text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: "#F5EBE0", color: "#1F2C3E" }}
                >
                  {storage}
                </span>
              )}
              {color && (
                <span
                  className="text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: "#F5EBE0", color: "#1F2C3E" }}
                >
                  {color}
                </span>
              )}
            </div>
          )}

          {/* Name */}
          <h3
            className="text-[12px] sm:text-[15px] md:text-[16px] font-bold leading-snug line-clamp-2"
            style={{ color: "#121E2E" }}
          >
            {name}
          </h3>

          {/* Divider */}
          <div className="my-2 border-t border-dashed" style={{ borderColor: "#DFC4A4" }} />

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span
                className="text-[16px] sm:text-[20px] md:text-[23px] font-black leading-none"
                style={{ color: "#121E2E" }}
              >
                {fmt(displayPrice)}
              </span>
              <span className="text-[11px] sm:text-[13px] font-bold" style={{ color: "#A77D4B" }}>
                ر.س
              </span>
            </div>
            {hasDiscount && (
              <span
                className="text-[9px] sm:text-[11px] line-through opacity-40 flex items-center gap-0.5"
                style={{ color: "#1F2C3E" }}
              >
                {fmt(originalPrice)} ر.س
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* ── Cart / Action Button ── */}
      <div className="px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5">
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] md:text-[14px] font-bold transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: "#1F2C3E",
            color: "#DFC4A4",
          }}
        >
          <IoArrowForward size={15} />
          اطلب الآن
        </button>
      </div>
    </div>
  );
}
