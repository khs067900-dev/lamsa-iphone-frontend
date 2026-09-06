import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPad | لمسه للاجهزه الذكيه",
  description:
    "iPad بشاشة رائعة وأداء قوي يناسب العمل والترفيه والإبداع",
};

export default async function IPadPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="ipad"
      heroImage="/ta.webp"
      nameEn="iPad"
      tagline="شاشتك لكل شيء"
      description="iPad بشاشة رائعة وأداء قوي يناسب العمل والترفيه والإبداع مع تجربة استخدام لا مثيل لها"
      features={[
        { icon: "display", label: "شاشة Liquid Retina" },
        { icon: "chip", label: "معالج Apple فائق السرعة" },
        { icon: "battery", label: "بطارية تدوم طوال اليوم" },
      ]}
      initialProducts={products}
    />
  );
}
