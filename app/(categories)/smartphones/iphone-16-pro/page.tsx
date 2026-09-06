import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 16 Pro | لمسه للاجهزه الذكيه",
  description: "iPhone 16 Pro بتصميم تيتانيوم وكاميرا احترافية ومعالج A18 Pro",
};

export default async function IPhone16ProPage() {
  const products = await getAllProducts();
  return (
   <PhoneHeroPage
  slug="iphone-16-pro"
  heroImage="/i16-pro.webp"
  nameEn="iPhone 16"
  nameEnLine2="Pro"
  tagline="احترافية بلا تنازلات"
  description="iPhone 16 Pro يجمع بين تصميم التيتانيوم الأنيق، وشاشة Super Retina XDR بتقنية ProMotion، وأداء معالج A18 Pro، مع نظام كاميرات احترافي يمنحك صورًا وفيديوهات بجودة استثنائية."
  features={[
    { icon: "display", label: "شاشة ProMotion 120Hz" },
    { icon: "camera", label: "كاميرا احترافية 48MP مع تقريب 5x" },
    { icon: "chip", label: "معالج A18 Pro" },
  ]}
  initialProducts={products}
/>
  );
}
