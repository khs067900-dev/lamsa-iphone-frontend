import type { Metadata } from "next";
import AppleOnlyClient from "./AppleOnlyClient";
import { getProductsByCategory } from "../../../lib/productsCache";
import { getCompany } from "../../../lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  return {
    title: `منتجات أبل | ${siteName}`,
    description: `تسوق جميع منتجات أبل - آيفون بجميع الإصدارات بأفضل الأسعار وبالأقساط في ${siteName}`,
  };
}

export default async function AppleOnlyPage() {
  const result = await getProductsByCategory({ brand: "Apple", limit: 200, sort: "storage-asc" });
  return <AppleOnlyClient initialProducts={result.products} />;
}
