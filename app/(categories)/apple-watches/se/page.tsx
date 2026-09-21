import type { Metadata } from "next";
import PhoneHeroPageWrapper from "../../../components/phones/PhoneHeroPageWrapper";

export const metadata: Metadata = {
  title: "Apple Watch SE | لمسه للاجهزه الذكيه",
  description:
    "ساعة Apple Watch SE بتصميم أنيق وأداء ذكي مع تتبع اللياقة والصحة بأفضل سعر",
};

export default async function AppleWatchSEPage() {
  return (
    <PhoneHeroPageWrapper
      slug="se"
      heroImage="/wat.webp"
      nameEn="Apple Watch"
      nameEnLine2="SE"
      tagline="ساعة ذكية بسعر ذكي"
      description="Apple Watch SE تجمع بين المميزات الأساسية للساعة الذكية وتتبع اللياقة والصحة بتصميم أنيق وسعر مناسب"
      features={[
        { icon: "design", label: "تصميم أنيق وخفيف" },
        { icon: "battery", label: "بطارية تدوم طول اليوم" },
        { icon: "chip", label: "معالج S8 SiP" },
      ]}
    />
  );
}
