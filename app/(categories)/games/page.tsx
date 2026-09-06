import type { Metadata } from "next";
import GamesClient from "./GamesClient";
import { getAllProducts } from "../../lib/productsCache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const SITE_URL = "https://lamsah-aldhaqiah.com";

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
    title: `اكسسورات | ${siteName}`,
    description: `تسوق أفضل الاكسسورات بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/games` },
  };
}

export default async function GamesPage() {
  const products = await getAllProducts();
  return <GamesClient initialProducts={products} />;
}
