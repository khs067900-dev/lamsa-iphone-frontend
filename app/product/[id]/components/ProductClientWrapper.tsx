"use client";

import { useState, useCallback } from "react";
import type { Product } from "../../../components/products/types";
import ProductGallery from "./ProductGallery";
import ProductInfoClient from "./ProductInfoClient";

interface Props {
  product: Product;
}

export default function ProductClientWrapper({ product }: Props) {
  const firstVariant = product.variants?.[0];

  const [selectedColor, setSelectedColor] = useState<string>(
    () => firstVariant?.color ?? product.color ?? ""
  );

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  // Compute the active variant's images; fall back to product-level images
  const activeVariant = product.variants?.find((v) => v.color === selectedColor);
  const variantImages =
    activeVariant?.images?.length ? activeVariant.images : undefined;

  return (
    <>
      {/* Images */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-3xl p-4 shadow-xl" style={{ border: "1px solid #EBE6E2" }}>
          <ProductGallery
            product={product}
            hasVariants={Boolean(product.variants?.length)}
            overrideImages={variantImages}
          />
        </div>
      </div>

      {/* Info */}
      <div className="lg:col-span-5">
        <h2
          className="hidden lg:block text-2xl xl:text-3xl font-black mb-5 leading-snug"
          style={{ color: "#1F2C3E" }}
        >
          {product.name}
        </h2>
        <ProductInfoClient
          product={product}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
        />
      </div>
    </>
  );
}
