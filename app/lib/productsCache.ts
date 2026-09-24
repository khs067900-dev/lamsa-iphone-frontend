import { unstable_cache } from "next/cache";
import type { Product } from "../components/products/types";

const ALLOWED_HOSTS = ["lamsasmart.com", "localhost", "127.0.0.1", "vercel.app"];

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

function assertSafeUrl(url: URL): void {
  const { hostname, protocol } = url;
  if (!ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`)))
    throw new Error(`Blocked request to untrusted host: ${hostname}`);
  if (protocol !== "http:" && protocol !== "https:")
    throw new Error(`Blocked request with untrusted protocol: ${protocol}`);
}

function safeFetch(url: URL, init?: RequestInit): Promise<Response> {
  assertSafeUrl(url);
  const safeHref: string = url.href;
  return fetch(safeHref, { ...init, signal: init?.signal ?? AbortSignal.timeout(10000) });
}

const FIELDS = "name originalPrice salePrice image images color storage category subCategory brand inStock freeDelivery warrantyYears installment discountPercent network price";

// [NEW] Optimized function to get products by category with server-side filtering
export const getProductsByCategory = (params: {
  category?: string;
  subCategory?: string;
  brand?: string;
  nameIncludes?: string[];
  nameExcludes?: string[];
  page?: number;
  limit?: number;
  sort?: string;
}) => {
  const { category, subCategory, brand, nameIncludes, nameExcludes, page = 1, limit = 50, sort = "storage-asc" } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (category) queryParams.set("category", category);
  if (subCategory) queryParams.set("subCategory", subCategory);
  if (brand) queryParams.set("brand", brand);
  if (nameIncludes && nameIncludes.length > 0) queryParams.set("nameIncludes", nameIncludes.join(","));
  if (nameExcludes && nameExcludes.length > 0) queryParams.set("nameExcludes", nameExcludes.join(","));
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  queryParams.set("sort", sort);
  queryParams.set("fields", FIELDS);
  
  const cacheKey = `products-by-category:${queryParams.toString()}`;
  
  return unstable_cache(
    async () => {
      try {
        const url = new URL("/api/products/by-category", BACKEND);
        url.search = queryParams.toString();
        const r = await safeFetch(url, { next: { tags: ["products"] } } as RequestInit);
        if (!r.ok) return { products: [], total: 0, page: 1, pages: 0 };
        const data = await r.json();
        return data;
      } catch {
        return { products: [], total: 0, page: 1, pages: 0 };
      }
    },
    [cacheKey],
    { revalidate: 120, tags: ["products"] }
  )();
};

export const getAllProducts = unstable_cache(
  async () => {
    try {
      const url = new URL("/api/products", BACKEND);
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "100");
      url.searchParams.set("fields", FIELDS);
      const r = await safeFetch(url, { next: { tags: ["products"] } } as RequestInit);
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : (data.products ?? []);
    } catch {
      return [];
    }
  },
  ["all-products"],
  { revalidate: 120, tags: ["products"] }
);

async function fetchProductsWithBanners() {
  let products: Product[] = [];
  try {
    const url = new URL("/api/products", BACKEND);
    url.searchParams.set("page", "1");
    // [FIX] Was 100 — not enough to cover all categories (DB has 230+ products).
    // Missing categories (17s, Samsung) were cut off and never reached the homepage.
    url.searchParams.set("limit", "300");
    url.searchParams.set("fields", FIELDS);
    const r = await safeFetch(url, { next: { tags: ["products"] } } as RequestInit);
    if (r.ok) {
      const data = await r.json();
      products = Array.isArray(data) ? data : (data.products ?? []);
    }
  } catch { /* backend unavailable at build time */ }

  const categories = [...new Set(products.map((p) => p.category || p.subCategory).filter(Boolean))] as string[];

  let bannerMap: Record<string, string[]> = {};
  if (categories.length) {
    try {
      const bannerUrl = new URL("/api/admin/category-banners-bulk", BACKEND);
      bannerUrl.searchParams.set("categories", categories.join(","));
      const br = await safeFetch(bannerUrl, { next: { revalidate: 120, tags: ["banners"] } } as RequestInit);
      if (br.ok) bannerMap = await br.json();
    } catch { /* banners are non-critical */ }
  }

  return { products, bannerMap };
}

const cachedFetch = unstable_cache(
  fetchProductsWithBanners,
  ["all-products-with-banners"],
  { revalidate: 120, tags: ["products", "banners"] }
);

export async function getAllProductsWithBanners() {
  const result = await cachedFetch();
  if (!result.products.length) {
    return fetchProductsWithBanners();
  }
  return result;
}

// All fields needed for product detail page — variants + specGroups + sections included
const PRODUCT_DETAIL_FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,description,specs,specGroups,variants,sections,network,price,taxIncluded,deliveryTime,brief";

export const getProductById = (id: string) => {
  const safeId = encodeURIComponent(id);
  return unstable_cache(
    async () => {
      try {
        const url = new URL(`/api/products/${safeId}`, BACKEND);
        url.searchParams.set("fields", PRODUCT_DETAIL_FIELDS);
        const r = await safeFetch(url, { next: { tags: ["products", `product-${safeId}`] } } as RequestInit);
        if (!r.ok) return null;
        return (await r.json()) as Product;
      } catch {
        return null;
      }
    },
    ["product-by-id", safeId],
    { revalidate: 120, tags: ["products", `product-${safeId}`] }
  )();
};
