import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "بطاريات متنقلة | لمسه للاجهزه الذكيه",
  description:
    "تسوق أفضل البطاريات المتنقلة من أنكر وغيرها بأسعار منافسة وشحن سريع وضمان معتمد",
};

export default async function AnkerBatteriesPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="anker-batteries"
      heroImage="/as.webp"
      nameEn="Power Banks"
      nameEnLine2="& Cables"
      tagline="بطاريات متنقلة وكيابل شحن"
      description="تسوق أفضل البطاريات المتنقلة من أنكر وكيابل الشحن السريع بجودة عالية وأسعار منافسة مع ضمان معتمد"
      features={[
        { icon: "battery", label: "شحن سريع" },
        { icon: "chip", label: "سعات متعددة" },
        { icon: "design", label: "تصميم محمول" },
      ]}
      initialProducts={products}
    />
  );
}
