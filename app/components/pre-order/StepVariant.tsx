"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { IoCheckmarkCircle } from "react-icons/io5";
import { fmt, resolveImg } from "./types";
import type { PreOrderProduct } from "./types";

export function StepVariant({ product, onNext }: {
  product: PreOrderProduct;
  onNext: (color: string, storage: string, price: number, image: string) => void;
}) {
  const variants = product.variants ?? [];
  const [color, setColor] = useState(variants[0]?.color ?? "");
  // Track the user's storage selection per color so switching colors resets to default
  const storageByColor = useRef<Record<string, string>>({});

  const activeVariant = variants.find(v => v.color === color) ?? variants[0];
  const storageOpts = activeVariant?.storageOptions ?? [];
  const defaultStorage = storageOpts[0]?.storage ?? "";
  // Derive storage: use persisted selection for this color, or fall back to default
  const storage = storageByColor.current[color] ?? defaultStorage;

  function handleColorChange(nextColor: string) {
    setColor(nextColor);
  }

  function handleStorageChange(nextStorage: string) {
    storageByColor.current[color] = nextStorage;
    // Force re-render by updating color state to same value via a functional updater trick
    setColor(c => c);
  }

  const activeOpt = storageOpts.find(o => o.storage === storage) ?? storageOpts[0];
  const price = activeOpt?.salePrice ?? activeOpt?.originalPrice ?? product.price;
  const img = activeVariant?.images?.[0] ?? product.image ?? "";

  return (
    <div className="flex flex-col gap-2.5 p-2.5 sm:gap-3 sm:p-3">
      {/* Product preview */}
      <div className="flex items-center gap-2 p-2 sm:gap-2.5 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
        {img && (
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            <Image src={resolveImg(img)} alt={product.name} width={56} height={56} className="object-contain p-1 scale-[2]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs sm:text-sm text-gray-800 leading-snug truncate">{product.name}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{color} · {storage}</p>
        </div>
        <div className="text-left shrink-0 pl-1">
          <p className="text-base sm:text-lg font-black text-gray-800 leading-none">{fmt(price)}</p>
          <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 text-center">ر.س</p>
        </div>
      </div>

      {/* Color */}
      {variants.length > 0 && (
        <div>
          <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1.5">
            اللون — <span className="text-gray-700">{color}</span>
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {variants.map(v => (
              <button
                key={v.color}
                onClick={() => handleColorChange(v.color)}
                title={v.color}
                className="relative rounded-full transition-all"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: v.colorCode,
                  boxShadow: color === v.color
                    ? "0 0 0 2px #fff, 0 0 0 3.5px #BC9255"
                    : "0 1px 3px rgba(0,0,0,0.2)",
                  transform: color === v.color ? "scale(1.12)" : "scale(1)",
                }}
              >
                {color === v.color && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <IoCheckmarkCircle size={11} className="text-white drop-shadow" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Storage */}
      {storageOpts.length > 0 && (
        <div>
          <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1.5">السعة</p>
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            {storageOpts.map(opt => {
              const p = opt.salePrice ?? opt.originalPrice;
              const active = storage === opt.storage;
              return (
                <button
                  key={opt.storage}
                  onClick={() => handleStorageChange(opt.storage)}
                  className="flex flex-col items-center px-1.5 py-1.5 sm:px-2 sm:py-2 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: active ? "#BC9255" : "#E5E7EB",
                    background: active ? "#FDF6EC" : "#fff",
                    color: active ? "#92400E" : "#374151",
                  }}
                >
                  <span className="text-[10px] sm:text-xs font-bold">{opt.storage}</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5" style={{ color: active ? "#BC9255" : "#9CA3AF" }}>
                    {fmt(p)} ر.س
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => onNext(color, storage, price, resolveImg(img))}
        className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-white text-xs sm:text-sm mt-0.5"
        style={{ background: "linear-gradient(135deg,#BC9255,#A77D4B)" }}
      >
        التالي — بياناتك الشخصية
      </button>
    </div>
  );
}
