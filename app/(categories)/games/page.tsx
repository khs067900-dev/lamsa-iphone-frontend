import type { Metadata } from "next";
import GamesClient from "./GamesClient";
import { getAllProducts } from "../../lib/productsCache";
import { SITE_URL, getCompany } from "../../lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  return {
    title: `اكسسورات | ${siteName}`,
    description: `تسوق أفضل الاكسسورات بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/games` },
  };
}

export default async function GamesPage() {
  const products = await getAllProducts();
  return <GamesClient initialProducts={products} />;
}
