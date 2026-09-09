import { slugConfigs } from "./categoryConfig";
import type { Product } from "../components/products/types";

export function normalizeArabic(str: string): string {
  return str
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

export function filterBySlug(products: Product[], slug: string): Product[] {
  const config = slugConfigs[slug];
  if (!config) return [];
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category
      ? normalizeArabic(p.category || "").includes(normalizeArabic(category))
      : true;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    const matchExclude = nameExcludes?.length
      ? !nameExcludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    return matchBrand && matchCategory && matchName && matchExclude;
  });
}

/** حساب الصور والأعداد لكل slug في مرور واحد فقط */
export function buildModelMeta(
  products: Product[],
  slugs: { slug: string }[],
  resolveImg: (src: string) => string
): {
  categoryImages: Record<string, string>;
  categoryCounts: Record<string, number>;
} {
  const categoryImages: Record<string, string> = {};
  const categoryCounts: Record<string, number> = {};

  for (const { slug } of slugs) {
    const filtered = filterBySlug(products, slug);
    categoryCounts[slug] = filtered.length;
    if (filtered.length > 0) {
      const img = filtered[0].images?.[0] || filtered[0].image;
      if (img) categoryImages[slug] = resolveImg(img);
    }
  }

  return { categoryImages, categoryCounts };
}
