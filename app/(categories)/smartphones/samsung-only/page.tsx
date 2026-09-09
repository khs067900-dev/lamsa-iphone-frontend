import type { Metadata } from "next";
import SamsungOnlyClient from "./SamsungOnlyClient";
import type { Product } from "../../../components/products/types";
import { getAllProducts } from "../../../lib/productsCache";
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
  const products = await getAllProducts() as Product[];
  return <SamsungOnlyClient initialProducts={products} />;
}
