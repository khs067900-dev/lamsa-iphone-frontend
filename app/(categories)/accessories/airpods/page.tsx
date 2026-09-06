import type { Metadata } from "next";
import PhoneHeroPage from "../../../components/phones/PhoneHeroPage";
import { getAllProducts } from "../../../lib/productsCache";

export const metadata: Metadata = {
  title: "AirPods | لمسه للاجهزه الذكيه",
  description:
    "سماعات AirPods من أبل بصوت استثنائي وإلغاء ضوضاء متقدم وتصميم مريح",
};

export default async function AirPodsPage() {
  const products = await getAllProducts();
  return (
    <PhoneHeroPage
      slug="airpods"
      heroImage="/ar.webp"
      nameEn="AirPods"
      tagline="صوت يغمرك من كل اتجاه"
      description="سماعات AirPods من أبل بصوت استثنائي وإلغاء ضوضاء متقدم وتصميم مريح يدوم طوال اليوم"
      features={[
        { icon: "design", label: "تصميم مريح وخفيف" },
        { icon: "chip", label: "شريحة Apple H2" },
        { icon: "battery", label: "بطارية تدوم حتى 6 ساعات" },
      ]}
      initialProducts={products}
    />
  );
}
