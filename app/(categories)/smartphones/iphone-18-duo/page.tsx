import type { Metadata } from "next";
import PhoneHeroPageWrapper from "../../../components/phones/PhoneHeroPageWrapper";

export const metadata: Metadata = {
  title: "iPhone 18 Duo | لمسه للاجهزه الذكيه",
  description: "iPhone 18 Duo — تصميم مزدوج فريد من Apple حصرياً على لمسه",
};

export default async function IPhone18DuoPage() {
  return (
    <PhoneHeroPageWrapper
      slug="iphone-18-duo"
      heroImage="https://res.cloudinary.com/bzwltpqf/image/upload/v1789129092/472da8f7-71d6-4978-ad76-27cbfa1b0103.webp"
      nameEn="iPhone 18"
      nameEnLine2="Duo"
      tagline="تصميم مزدوج فريد من Apple"
      description="iPhone 18 Duo يقدم تجربة فريدة بتصميم مزدوج مبتكر مع أداء استثنائي ومعالج A19 من الجيل الجديد"
      features={[
        { icon: "battery", label: "بطارية تدوم طول اليوم" },
        { icon: "camera", label: "نظام كاميرات مزدوج" },
        { icon: "chip", label: "معالج A20" },
      ]}
    />
  );
}
