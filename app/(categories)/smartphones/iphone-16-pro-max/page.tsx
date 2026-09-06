import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 16 Pro Max | لمسه للاجهزه الذكيه",
  description: "iPhone 16 Pro Max بأكبر شاشة وأقوى بطارية مع معالج A18 Pro",
};

export default async function IPhone16ProMaxPage() {
  const products = await getAllProducts();
  return (
  <PhoneHeroPage
  slug="iphone-16-pro-max"
  heroImage="/i16-pro.webp"
  nameEn="iPhone 16"
  nameEnLine2="Pro Max"
  tagline="أكبر شاشة. أقصى أداء. احتراف بلا حدود."
  description="iPhone 16 Pro Max يأتي بتصميم فاخر من التيتانيوم، وشاشة Super Retina XDR مقاس 6.9 بوصة، ومعالج A18 Pro القوي، ونظام كاميرات احترافي يمنحك أفضل تجربة تصوير وأداء من Apple."
  features={[
    { icon: "display", label: "شاشة 6.9 بوصة ProMotion 120Hz" },
    { icon: "camera", label: "كاميرا احترافية 48MP مع تقريب 5x" },
    { icon: "chip", label: "معالج A18 Pro" },
  ]}
  initialProducts={products}
/>
  );
}
