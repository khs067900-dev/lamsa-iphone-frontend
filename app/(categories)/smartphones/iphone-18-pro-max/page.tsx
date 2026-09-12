import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "iPhone 18 Pro Max | لمسه للاجهزه الذكيه",
  description:
    "iPhone 18 Pro Max — الأقوى والأكبر من Apple حصرياً على لمسه",
};

export default async function IPhone18ProMaxPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="iphone-18-pro-max"
      heroImage="/i-18.webp"
      nameEn="iPhone 18"
      nameEnLine2="Pro Max"
      tagline="الأقوى والأكبر من Apple"
      description="iPhone 18 Pro Max يجمع بين تصميم التيتانيوم الأنيق والأداء الخرافي مع كاميرات احترافية من الجيل الجديد"
      features={[
        { icon: "battery", label: "بطارية تدوم طول اليوم" },
        { icon: "camera", label: "نظام كاميرات احترافي" },
        { icon: "chip", label: "معالج A19 Pro" },
      ]}
      initialProducts={products}
    />
  );
}
