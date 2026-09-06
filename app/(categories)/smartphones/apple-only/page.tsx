import type { Metadata } from "next";
import AppleOnlyClient from "./AppleOnlyClient";
import type { Product } from "../../../components/products/types";
import { getAllProducts } from "../../../lib/productsCache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, { next: { revalidate: 3600 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

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
