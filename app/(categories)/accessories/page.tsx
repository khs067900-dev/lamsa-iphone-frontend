import type { Metadata } from "next";
import PhoneHeroPage from "../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../lib/productsCache";

export const metadata: Metadata = {
  title: "اكسسوارات | لمسه للاجهزه الذكيه",
  description:
    "تسوق أفضل الاكسسوارات من بطاريات متنقلة وكيابل وسماعات بأفضل الأسعار مع ضمان معتمد",
};

export default async function AccessoriesPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="anker-batteries"
      heroImage="/ac.webp"
      nameEn="Accessories"
      tagline="بطاريات متنقلة وكيابل واكسسوارات"
      description="تسوق أفضل الاكسسوارات من بطاريات متنقلة أنكر وكيابل شحن وملحقات بأسعار منافسة وضمان معتمد"
      features={[
        { icon: "battery", label: "بطاريات متنقلة" },
        { icon: "chip", label: "شحن سريع" },
        { icon: "design", label: "جودة عالية" },
      ]}
      initialProducts={products}
    />
  );
}
