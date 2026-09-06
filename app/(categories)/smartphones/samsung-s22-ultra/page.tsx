import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "Samsung Galaxy S22 Ultra | لمسه للاجهزه الذكيه",
  description: "سامسونج جالكسي S22 الترا بأفضل سعر مع ضمان معتمد وتقسيط مريح",
};

export default async function SamsungS22UltraPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="samsung-s22-ultra"
      heroImage="/s25.webp"
      nameEn="Galaxy S22"
      nameEnLine2="Ultra"
      tagline="قوة الأداء مع قلم S Pen"
      description="سامسونج جالكسي S22 الترا مع كاميرا 108MP ومعالج Snapdragon 8 Gen 1 وقلم S Pen مدمج وشاشة Dynamic AMOLED 2X."
      features={[
        { icon: "camera", label: "كاميرا 108MP مع زوم 100x" },
        { icon: "chip", label: "معالج Snapdragon 8 Gen 1" },
        { icon: "display", label: "شاشة 6.8 بوصة 120Hz" },
      ]}
      initialProducts={products}
    />
  );
}
