import type { Metadata } from "next";
import PhoneHeroPageWrapper from "../../../components/phones/PhoneHeroPageWrapper";

export const metadata: Metadata = {
  title: "iPhone 18 Pro | لمسه للاجهزه الذكيه",
  description: "iPhone 18 Pro — أداء احترافي متقدم من Apple حصرياً على لمسه",
};

export default async function IPhone18ProPage() {
  return (
    <PhoneHeroPageWrapper
      slug="iphone-18-pro"
      heroImage="/i-18-1.webp"
      nameEn="iPhone 18"
      nameEnLine2="Pro"
      tagline="أداء احترافي من الجيل الجديد"
      description="iPhone 18 Pro يجمع بين تصميم التيتانيوم الفاخر وأقوى معالج في تاريخ Apple مع نظام كاميرات احترافي من الجيل الجديد"
      features={[
        { icon: "battery", label: "بطارية تدوم طول اليوم" },
        { icon: "camera", label: "نظام كاميرات احترافي" },
        { icon: "chip", label: "معالج A20 Pro" },
      ]}
    />
  );
}
