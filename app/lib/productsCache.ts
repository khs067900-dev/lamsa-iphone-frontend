import { unstable_cache } from "next/cache";
import type { Product } from "../components/products/types";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,description,specs,network,price";

// Keep backend warm — fire and forget, never blocks rendering
export function pingBackend() {
  if (typeof window !== "undefined") {
    const PUBLIC = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${PUBLIC}/ping`, { cache: "no-store" }).catch(() => {});
  }
}

export const getAllProducts = unstable_cache(
  async () => {
    const r = await fetch(
      `${BACKEND}/api/products?page=1&limit=500&fields=${FIELDS}`,
      { next: { tags: ["products"] } }
    );
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : (data.products ?? []);
  },
  ["all-products"],
  { revalidate: 300, tags: ["products"] }
);

export const getAllProductsWithBanners = unstable_cache(
  async () => {
    const r = await fetch(
      `${BACKEND}/api/products?page=1&limit=500&fields=${FIELDS}`,
      { next: { tags: ["products"] } }
    );
    if (!r.ok) return { products: [], bannerMap: {} };
    const data = await r.json();
    const products: Product[] = Array.isArray(data) ? data : (data.products ?? []);

    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

    let bannerMap: Record<string, string[]> = {};
    if (categories.length) {
      try {
        const br = await fetch(
          `${BACKEND}/api/admin/category-banners-bulk?categories=${encodeURIComponent(categories.join(","))}`,
          { next: { revalidate: 300, tags: ["banners"] } }
        );
        if (br.ok) bannerMap = await br.json();
      } catch { /* banners are non-critical */ }
    }

    return { products, bannerMap };
  },
  ["all-products-with-banners"],
  { revalidate: 300, tags: ["products", "banners"] }
);

export async function getProductById(id: string) {
  const products = await getAllProducts();
  return (products as Product[]).find((p) => p._id === id) ?? null;
}
