import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 17 Air | لمسه للاجهزه الذكيه",
  description: "iPhone 17 Air الأنحف والأخف في تاريخ آيفون بتصميم أنيق وأداء سلس",
};

export default async function IPhone17AirPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
  slug="iphone-17-air"
  heroImage="/i17-air.webp"
  nameEn="iPhone 17"
  nameEnLine2="Air"
  tagline="أنحف آيفون على الإطلاق"
  description="iPhone 17 Air يقدم تصميمًا فائق النحافة وخفيف الوزن مع شاشة Super Retina XDR مذهلة، وأداء قوي بمعالج A19 Pro، ليمنحك تجربة احترافية في تصميم أنيق للغاية."
  features={[
    { icon: "design", label: "تصميم فائق النحافة" },
    { icon: "display", label: "شاشة Super Retina XDR 120Hz" },
    { icon: "chip", label: "معالج A19 Pro" },
  ]}
  initialProducts={products}
/>
  );
}
