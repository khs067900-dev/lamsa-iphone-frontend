import type { Metadata } from "next";
import PhoneHeroPage from "../../components/phones/PhoneHeroPage";
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
    title: `أجهزة صوت و سماعات | ${siteName}`,
    description: `تسوق سماعات أبل وأجهزة الصوت بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/audio` },
  };
}

export default async function AudioPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="audio"
      heroImage="/hed.webp"
      nameEn="Audio"
      nameEnLine2="& Speakers"
      tagline="أجهزة صوت و سماعات"
      description="تسوق أفضل سماعات أبل وسبيكرات وسماعات متنوعة بصوت استثنائي وجودة عالية بأسعار منافسة"
      features={[
        { icon: "design", label: "تصميم مريح" },
        { icon: "chip", label: "صوت نقي" },
        { icon: "battery", label: "بطارية طويلة" },
      ]}
      initialProducts={products}
    />
  );
}
