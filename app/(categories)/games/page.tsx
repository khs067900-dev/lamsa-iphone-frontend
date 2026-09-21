import type { Metadata } from "next";
import GamesClient from "./GamesClient";
import { getAllProducts } from "../../lib/productsCache";
import { SITE_URL, getCompany } from "../../lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "لمسه للاجهزه الذكيه";
  return {
    title: `ألعاب الفيديو | ${siteName}`,
    description: `تسوق أفضل الاكسسورات بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/games` },
  };
}

export default async function GamesPage() {
  // GamesClient filters across multiple game sub-categories client-side
  // (gaming, mice-keyboards, microphone, figures, rgb) so we fetch all products
  // and let the client filter — consistent with how this page has always worked.
  const products = await getAllProducts();
  return <GamesClient initialProducts={products} />;
}
