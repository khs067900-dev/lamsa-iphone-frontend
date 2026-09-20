import type { Product } from "../components/products/types";
import { sortProducts } from "./sortProducts";

const FEATURED: { slug: string; label: string; category: string; nameExcludes?: string[] }[] = [
  { slug: "iphone-18-pro-max", label: "Pro Max", category: "ابل ايفون 18 برو ماكس" },
  { slug: "iphone-18-pro",     label: "Pro",     category: "ابل ايفون 18 برو", nameExcludes: ["ماكس", "max"] },
  { slug: "iphone-18-duo",     label: "Duo",     category: "ابل ايفون 18", nameExcludes: ["برو", "pro", "ماكس", "max"] },
];

function normalizeAr(s: string) {
  return s.replace(/[أإآا]/g, "ا").replace(/[ىي]/g, "ي").replace(/ة/g, "ه").replace(/[ؤئ]/g, "و");
}

function pickProduct(products: Product[], cfg: (typeof FEATURED)[0]): Product | null {
  const filtered = products.filter((p) => {
    const cat = normalizeAr(p.category || "");
    const name = p.name?.toLowerCase() || "";
    if (!cat.includes(normalizeAr(cfg.category))) return false;
    if (cfg.nameExcludes?.some((kw) => name.includes(kw.toLowerCase()))) return false;
    return true;
  });
  const sorted = sortProducts(filtered);
  return sorted[0] ?? null;
}


export type FeaturedEntry = { slug: string; label: string; product: Product };

export function getFeaturedIPhones(products: Product[]): FeaturedEntry[] {
  return FEATURED.flatMap((cfg) => {
    const product = pickProduct(products, cfg);
    return product ? [{ slug: cfg.slug, label: cfg.label, product }] : [];
  });
}
