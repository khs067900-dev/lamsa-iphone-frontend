import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "Samsung Galaxy S23 Ultra | لمسه للاجهزه الذكيه",
  description: "سامسونج جالكسي S23 الترا بأفضل سعر مع ضمان معتمد وتقسيط مريح",
};

export default async function SamsungS23UltraPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="samsung-s23-ultra"
      heroImage="/s25.webp"
      nameEn="Galaxy S23"
      nameEnLine2="Ultra"
      tagline="الكاميرا الأقوى في تاريخ Galaxy"
      description="سامسونج جالكسي S23 الترا مع كاميرا 200MP ومعالج Snapdragon 8 Gen 2 وقلم S Pen مدمج وبطارية تدوم طول اليوم."
      features={[
        { icon: "camera", label: "كاميرا 200MP احترافية" },
        { icon: "chip", label: "معالج Snapdragon 8 Gen 2" },
        { icon: "battery", label: "بطارية 5000mAh" },
      ]}
      initialProducts={products}
    />
  );
}
