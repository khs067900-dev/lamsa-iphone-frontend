import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 17 Pro | لمسه للاجهزه الذكيه",
  description: "iPhone 17 Pro بتصميم تيتانيوم متطور وكاميرا احترافية ومعالج A19 Pro",
};

export default async function IPhone17ProPage() {
  const products = await getAllProducts();
  return (
  <PhoneHeroPage
  slug="iphone-17-pro"
  heroImage="/i17-pro.webp"
  nameEn="iPhone 17"
  nameEnLine2="Pro"
  tagline="قوة احترافية في حجم مثالي"
  description="iPhone 17 Pro يجمع بين تصميم التيتانيوم الفاخر وأداء معالج A19 Pro ونظام كاميرات احترافي يمنحك تجربة تصوير استثنائية في جهاز أكثر سهولة في الاستخدام."
  features={[
    { icon: "camera", label: "نظام كاميرات احترافي 48MP" },
    { icon: "chip", label: "معالج A19 Pro" },
    { icon: "display", label: "شاشة ProMotion بتردد 120Hz" },
  ]}
  initialProducts={products}
/>
  );
}
