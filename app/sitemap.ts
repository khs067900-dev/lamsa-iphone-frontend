import { MetadataRoute } from "next";
import { slugConfigs } from "./lib/categoryConfig";
import { getAllProducts } from "./lib/productsCache";

export const revalidate = 3600;

const BASE_URL = "https://lamsasmart.com";

const staticRoutes = [
  "",
  "/smartphones",
  "/apple-watches",
  "/audio",
  "/playstation",
  "/tablets",
  "/accessories",
  "/games",
  "/cart",
  "/checkout",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_urls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const slug_urls: MetadataRoute.Sitemap = Object.keys(slugConfigs).map((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  let product_urls: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    product_urls = (products as { _id: string }[]).map((p) => ({
      url: `${BASE_URL}/product/${p._id}`,
      changeFrequency: "daily",
      priority: 0.6,
    }));
  } catch {
    // skip if backend unavailable
  }

  return [...static_urls, ...slug_urls, ...product_urls];
}
