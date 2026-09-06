import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "Samsung Galaxy S26 Ultra | لمسه للاجهزه الذكيه",
  description: "سامسونج جالكسي S26 الترا بأفضل سعر مع ضمان معتمد وتقسيط مريح",
};

export default async function SamsungS26UltraPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="samsung-s26-ultra"
      heroImage="/s26.webp"
      nameEn="Galaxy S26"
      nameEnLine2="Ultra"
      tagline="القوة والذكاء في تصميم واحد"
      description="سامسونج جالكسي S26 الترا يأتي بتصميم فاخر من التيتانيوم مع معالج Snapdragon من الجيل الجديد وكاميرا 200MP ونظام Galaxy AI المتطور."
      features={[
        { icon: "camera", label: "كاميرا 200MP احترافية" },
        { icon: "chip", label: "معالج Snapdragon الأحدث" },
        { icon: "battery", label: "بطارية 5000mAh" },
      ]}
      initialProducts={products}
    />
  );
}
