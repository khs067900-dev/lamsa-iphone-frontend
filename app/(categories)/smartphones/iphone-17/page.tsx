import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 17 | لمسه للاجهزه الذكيه",
  description: "iPhone 17 الجديد بتصميم عصري وأداء قوي وكاميرا مطورة",
};

export default async function IPhone17Page() {
  const products = await getAllProducts();
  return (
   <PhoneHeroPage
  slug="iphone-17"
  heroImage="/i17.webp"
  nameEn="iPhone 17"
  nameEnLine2=""
  tagline="قوة أكبر. أداء أذكى. كل يوم."
  description="iPhone 17 يجمع بين التصميم الأنيق، وشاشة Super Retina XDR السلسة، وأداء معالج A19، مع نظام كاميرات متطور يمنحك صورًا وفيديوهات مذهلة في كل لحظة."
  features={[
    { icon: "display", label: "شاشة Super Retina XDR" },
    { icon: "camera", label: "كاميرا مزدوجة 48MP" },
    { icon: "chip", label: "معالج A19" },
  ]}
  initialProducts={products}
/>
  );
}
