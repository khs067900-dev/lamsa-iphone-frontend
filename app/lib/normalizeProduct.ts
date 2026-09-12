import type { Product, ProductVariant } from "../components/products/types";

export interface CardProduct {
  _id: string;
  name: string;
  image: string | undefined;
  originalPrice: number;
  salePrice: number | undefined;
  discountPercent: number;
  color: string | undefined;
  storage: string | undefined;
  inStock: boolean;
}

function resolveDefaultVariant(variants: ProductVariant[] | undefined): ProductVariant | undefined {
  // Matches the same logic used in ProductPageClient: variants[0] is the default
  return variants?.[0];
}

export function normalizeProductForCard(product: Product): CardProduct {
  const defaultVariant = resolveDefaultVariant(product.variants);

  const color = product.color || defaultVariant?.color;
  const storage = product.storage || defaultVariant?.defaultStorage;

  const image = product.images?.[0] || product.image;

  const originalPrice = product.originalPrice || product.price || 0;
  const rawSalePrice = product.salePrice;
  const salePrice = rawSalePrice != null && rawSalePrice > 0 && rawSalePrice < originalPrice
    ? rawSalePrice
    : undefined;

  const discountPercent =
    product.discountPercent > 0
      ? product.discountPercent
      : salePrice != null
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

  return {
    _id: product._id,
    name: product.name,
    image,
    originalPrice,
    salePrice,
    discountPercent,
    color,
    storage,
    inStock: product.inStock ?? true,
  };
}
