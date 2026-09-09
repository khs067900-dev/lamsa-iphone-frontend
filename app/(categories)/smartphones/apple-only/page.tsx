import type { Metadata } from "next";
import AppleOnlyClient from "./AppleOnlyClient";
import type { Product } from "../../../components/products/types";
import { getAllProducts } from "../../../lib/productsCache";
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
  const products = await getAllProducts() as Product[];
  return <AppleOnlyClient initialProducts={products} />;
}
