import type { Metadata } from "next";
import PhoneHeroPageWrapper from "../../../components/phones/PhoneHeroPageWrapper";

export const metadata: Metadata = {
  title: "iPhone 16 Plus | لمسه للاجهزه الذكيه",
  description: "iPhone 16 Plus بشاشة أكبر وبطارية أقوى وأداء مميز",
};

export default async function IPhone16PlusPage() {
  return (
    <PhoneHeroPageWrapper
      slug="iphone-16-plus"
      heroImage="/i17.webp"
      nameEn="iPhone 16"
      nameEnLine2="Plus"
      tagline="شاشة أكبر. بطارية تدوم أكثر."
      description="iPhone 16 Plus يقدم شاشة Super Retina XDR كبيرة، وأداء قوي بمعالج A18، ونظام كاميرات متطور بدقة 48MP، مع بطارية تدوم طوال اليوم لتجربة استخدام استثنائية."
      features={[
        { icon: "display", label: "شاشة Super Retina XDR مقاس 6.7 بوصة" },
        { icon: "camera", label: "كاميرا مزدوجة 48MP" },
        { icon: "chip", label: "معالج A18" },
      ]}
    />
  );
}
