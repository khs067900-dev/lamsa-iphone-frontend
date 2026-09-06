import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "Samsung Galaxy S25 Ultra | لمسه للاجهزه الذكيه",
  description: "سامسونج جالكسي S25 الترا بأفضل سعر مع ضمان معتمد وتقسيط مريح",
};

export default async function SamsungS25UltraPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="samsung-s25-ultra"
      heroImage="/s25.webp"
      nameEn="Galaxy S25"
      nameEnLine2="Ultra"
      tagline="ذكاء Galaxy AI بلا حدود"
      description="سامسونج جالكسي S25 الترا مع معالج Snapdragon 8 Elite وكاميرا 200MP وتصميم تيتانيوم أنيق مع أقوى نظام ذكاء اصطناعي من سامسونج."
      features={[
        { icon: "camera", label: "كاميرا 200MP مع زوم 100x" },
        { icon: "chip", label: "معالج Snapdragon 8 Elite" },
        { icon: "battery", label: "بطارية 5000mAh" },
      ]}
      initialProducts={products}
    />
  );
}
