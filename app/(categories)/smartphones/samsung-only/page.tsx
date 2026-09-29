import type { Metadata } from "next";
import SamsungOnlyClient from "./SamsungOnlyClient";
import { getProductsByCategory } from "../../../lib/productsCache";
import { getCompany } from "../../../lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  return {
    title: `منتجات سامسونج | ${siteName}`,
    description: `تسوق جميع منتجات سامسونج - جالكسي بجميع الإصدارات بأفضل الأسعار وبالأقساط في ${siteName}`,
  };
}

export default async function SamsungOnlyPage() {
  const result = await getProductsByCategory({ brand: "Samsung", limit: 100, sort: "storage-asc" });
  return <SamsungOnlyClient initialProducts={result.products} />;
}
