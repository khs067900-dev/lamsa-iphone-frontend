import { unstable_cache } from "next/cache";
import type { Product } from "../components/products/types";

const ALLOWED_HOSTS = ["lamsasmart.com", "lamsa-iphone-backend.vercel.app", "localhost", "127.0.0.1"];

function validateBackendUrl(raw: string): string {
  try {
    const { hostname, protocol } = new URL(raw);
    if (!ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
      throw new Error(`Untrusted BACKEND_URL host: ${hostname}`);
    }
    if (protocol !== "http:" && protocol !== "https:") {
      throw new Error(`Untrusted BACKEND_URL protocol: ${protocol}`);
    }
    return raw.replace(/\/$/, "");
  } catch (e) {
    if (e instanceof TypeError) throw new Error(`Invalid BACKEND_URL: ${raw}`);
    throw e;
  }
}

export const BACKEND = validateBackendUrl(process.env.BACKEND_URL || "http://localhost:5000");
const FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,network,price";

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
  { revalidate: 3600, tags: ["products"] }
);

// reuses getAllProducts cache — no duplicate fetch
export const getAllProductsWithBanners = unstable_cache(
  async () => {
    const products: Product[] = await getAllProducts();

    const categories = [...new Set(products.map((p) => p.category || p.subCategory).filter(Boolean))] as string[];

    let bannerMap: Record<string, string[]> = {};
    if (categories.length) {
      try {
        const br = await fetch(
          `${BACKEND}/api/admin/category-banners-bulk?categories=${encodeURIComponent(categories.join(","))}`,
          { next: { revalidate: 3600, tags: ["banners"] } }
        );
        if (br.ok) bannerMap = await br.json();
      } catch { /* banners are non-critical */ }
    }

    return { products, bannerMap };
  },
  ["all-products-with-banners"],
  { revalidate: 3600, tags: ["products", "banners"] }
);

const PRODUCT_DETAIL_FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,description,specs,network,price,taxIncluded,deliveryTime,overview,features,detailedSpecs";

export const getProductById = (id: string) =>
  unstable_cache(
    async () => {
      const r = await fetch(
        `${BACKEND}/api/products/${id}?fields=${PRODUCT_DETAIL_FIELDS}`,
        { next: { tags: ["products", `product-${id}`] } }
      );
      if (!r.ok) return null;
      return (await r.json()) as Product;
    },
    ["product-by-id", id],
    { revalidate: 3600, tags: ["products", `product-${id}`] }
  )();
