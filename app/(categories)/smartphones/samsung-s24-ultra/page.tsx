import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "Samsung Galaxy S24 Ultra | لمسه للاجهزه الذكيه",
  description: "سامسونج جالكسي S24 الترا بأفضل سعر مع ضمان معتمد وتقسيط مريح",
};

export default async function SamsungS24UltraPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="samsung-s24-ultra"
      heroImage="/s25.webp"
      nameEn="Galaxy S24"
      nameEnLine2="Ultra"
      tagline="أداء خرافي وذكاء اصطناعي متقدم"
      description="سامسونج جالكسي S24 الترا بتصميم تيتانيوم ومعالج Snapdragon 8 Gen 3 وكاميرا 200MP مع Galaxy AI لتجربة ذكية بلا حدود."
      features={[
        { icon: "camera", label: "كاميرا 200MP مع زوم بصري" },
        { icon: "chip", label: "معالج Snapdragon 8 Gen 3" },
        { icon: "display", label: "شاشة 6.8 بوصة Dynamic AMOLED" },
      ]}
      initialProducts={products}
    />
  );
}
