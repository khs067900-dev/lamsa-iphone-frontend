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
  return fetch(safeHref, init);
}

const FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,network,price";

export const getAllProducts = unstable_cache(
  async () => {
    const url = new URL("/api/products", BACKEND);
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "500");
    url.searchParams.set("fields", FIELDS);
    const r = await safeFetch(url, { next: { tags: ["products"] } } as RequestInit);
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : (data.products ?? []);
  },
  ["all-products"],
  { revalidate: 3600, tags: ["products"] }
);

async function fetchProductsWithBanners() {
  const url = new URL("/api/products", BACKEND);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", "500");
  url.searchParams.set("fields", FIELDS);
  const r = await safeFetch(url, { next: { tags: ["products"] } } as RequestInit);
  const data = r.ok ? await r.json() : {};
  const products: Product[] = Array.isArray(data) ? data : (data.products ?? []);

  const categories = [...new Set(products.map((p) => p.category || p.subCategory).filter(Boolean))] as string[];

  let bannerMap: Record<string, string[]> = {};
  if (categories.length) {
    try {
      const bannerUrl = new URL("/api/admin/category-banners-bulk", BACKEND);
      bannerUrl.searchParams.set("categories", categories.join(","));
      const br = await safeFetch(bannerUrl, { next: { revalidate: 3600, tags: ["banners"] } } as RequestInit);
      if (br.ok) bannerMap = await br.json();
    } catch { /* banners are non-critical */ }
  }

  return { products, bannerMap };
}

const cachedFetch = unstable_cache(
  fetchProductsWithBanners,
  ["all-products-with-banners"],
  { revalidate: 3600, tags: ["products", "banners"] }
);

export async function getAllProductsWithBanners() {
  const result = await cachedFetch();
  if (!result.products.length) {
    return fetchProductsWithBanners();
  }
  return result;
}

const PRODUCT_DETAIL_FIELDS = "name,originalPrice,salePrice,image,images,color,storage,category,subCategory,brand,inStock,freeDelivery,warrantyYears,installment,discountPercent,description,specs,network,price,taxIncluded,deliveryTime,overview,features,detailedSpecs";

export const getProductById = (id: string) => {
  const safeId = encodeURIComponent(id);
  return unstable_cache(
    async () => {
      const url = new URL(`/api/products/${safeId}`, BACKEND);
      url.searchParams.set("fields", PRODUCT_DETAIL_FIELDS);
      const r = await safeFetch(url, { next: { tags: ["products", `product-${safeId}`] } } as RequestInit);
      if (!r.ok) return null;
      return (await r.json()) as Product;
    },
    ["product-by-id", safeId],
    { revalidate: 3600, tags: ["products", `product-${safeId}`] }
  )();
};
