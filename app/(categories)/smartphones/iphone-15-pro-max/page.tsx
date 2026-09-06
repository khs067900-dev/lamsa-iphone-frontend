import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 15 Pro Max | لمسه للاجهزه الذكيه",
  description: "iPhone 15 Pro Max بتصميم تيتانيوم ومعالج A17 Pro وكاميرا احترافية",
};

export default async function IPhone15ProMaxPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
  slug="iphone-15-pro-max"
  heroImage="/i-16plus.webp"
  nameEn="iPhone 15"
  nameEnLine2="Pro Max"
  tagline="قمة الأداء. أقصى احترافية."
  description="iPhone 15 Pro Max يجمع بين تصميم التيتانيوم الخفيف، وشاشة Super Retina XDR الكبيرة، وأداء معالج A17 Pro، مع نظام كاميرات احترافي وعدسة Telephoto بتقريب بصري 5x لالتقاط أدق التفاصيل."
  features={[
    { icon: "display", label: "شاشة 6.7 بوصة ProMotion 120Hz" },
    { icon: "camera", label: "كاميرا 48MP مع تقريب بصري 5x" },
    { icon: "chip", label: "معالج A17 Pro" },
  ]}
  initialProducts={products}
/>
  );
}
