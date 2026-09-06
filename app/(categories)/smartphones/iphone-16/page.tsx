import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 16 | لمسه للاجهزه الذكيه",
  description: "iPhone 16 بتصميم جديد وألوان مميزة وأداء قوي",
};

export default async function IPhone16Page() {
  const products = await getAllProducts();
  return (
 <PhoneHeroPage
  slug="iphone-16"
  heroImage="/i17.webp"
  nameEn="iPhone 16"
  nameEnLine2=""
  tagline="الأداء الذي تحتاجه. الذكاء الذي تحبه."
  description="iPhone 16 يجمع بين التصميم الأنيق، وشاشة Super Retina XDR المذهلة، وأداء معالج A18 السريع، مع كاميرا 48MP المتطورة لتمنحك صورًا وفيديوهات بجودة استثنائية كل يوم."
  features={[
    { icon: "display", label: "شاشة Super Retina XDR مقاس 6.1 بوصة" },
    { icon: "camera", label: "كاميرا مزدوجة 48MP" },
    { icon: "chip", label: "معالج A18" },
  ]}
  initialProducts={products}
/>
  );
}
