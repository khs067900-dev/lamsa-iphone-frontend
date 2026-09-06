import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 17 Pro Max | لمسه للاجهزه الذكيه",
  description:
    "iPhone 17 Pro Max يجمع بين تصميم التيتانيوم الأنيق والأداء الخرافي مع كاميرات احترافية من الجيل الجديد",
};

export default async function IPhone17ProMaxPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="iphone-17-pro-max"
      heroImage="/i17-pro.webp"
      nameEn="iPhone 17"
      nameEnLine2="Pro Max"
      tagline="الأقوى والأسرع والأكثر احترافية"
      description="iPhone 17 Pro Max يجمع بين تصميم التيتانيوم الأنيق والأداء الخرافي مع كاميرات احترافية من الجيل الجديد"
      features={[
        { icon: "battery", label: "بطارية تدوم طول اليوم" },
        { icon: "camera", label: "نظام كاميرات احترافي" },
        { icon: "chip", label: "معالج A19 Pro" },
      ]}
      initialProducts={products}
    />
  );
}
