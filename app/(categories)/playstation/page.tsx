import type { Metadata } from "next";
import PhoneHeroPage from "../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../lib/productsCache";

const SITE_URL = "https://lamsah-aldhaqiah.com";

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
    title: `أجهزة بلاي ستيشن | ${siteName}`,
    description: `تسوق أجهزة بلاي ستيشن وإكس بوكس وملحقاتها بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`,
    alternates: { canonical: `${SITE_URL}/playstation` },
  };
}

export default async function PlaystationPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="ps5"
      heroImage="/pl.webp"
      nameEn="PlayStation"
      nameEnLine2="& Xbox"
      tagline="أجهزة بلاي ستيشن وإكس بوكس"
      description="تسوق أحدث أجهزة بلاي ستيشن 5 وإكس بوكس ويد تحكم وملحقات الألعاب بأفضل الأسعار وضمان معتمد"
      features={[
        { icon: "chip", label: "أداء خرافي" },
        { icon: "design", label: "تصميم عصري" },
        { icon: "battery", label: "ترفيه بلا حدود" },
      ]}
      initialProducts={products}
    />
  );
}
